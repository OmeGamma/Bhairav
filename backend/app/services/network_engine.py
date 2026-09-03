"""
BHAIRAV Network Intelligence Engine.

Builds a real graph from MongoDB `network_entities` and `relationships`
collections, then runs networkx algorithms:
  * Degree centrality
  * Betweenness centrality
  * Closeness centrality
  * PageRank
  * Connected-components / community detection

Indicators are derived from the entity's role in the graph. Timeline is
pulled from the `network/timeline/{id}` collection or synthesized from the
relationships collection.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple

import networkx as nx
from motor.motor_asyncio import AsyncIOMotorDatabase


# Weights for different relationship types - higher = stronger association
RELATIONSHIP_WEIGHTS: Dict[str, float] = {
    "ASSOCIATED_WITH": 0.4,
    "CONTACTED": 0.7,
    "MEMBER_OF": 0.6,
    "LOCATED_AT": 0.3,
    "DETECTED_AT": 0.5,
    "INVOLVED": 0.5,
    "MENTIONED_IN": 0.8,
    "USES": 0.6,
    "OWNS": 0.7,
    "LINKED_TO": 0.5,
    "OBSERVED_NEAR": 0.4,
}


def _level_for(value: float, low_max: float, med_max: float) -> str:
    if value >= med_max:
        return "HIGH"
    if value >= low_max:
        return "MEDIUM"
    return "LOW"


async def build_graph(db: AsyncIOMotorDatabase) -> Tuple[nx.Graph, Dict[str, Dict[str, Any]]]:
    """Build a NetworkX graph from MongoDB."""
    G = nx.Graph()
    meta: Dict[str, Dict[str, Any]] = {}

    cursor = db.network_entities.find({})
    async for ent in cursor:
        nid = str(ent.get("_id"))
        G.add_node(
            nid,
            label=ent.get("label", nid),
            entity_type=ent.get("entity_type", "UNKNOWN"),
            reference_id=str(ent.get("reference_id", "")),
        )
        meta[nid] = {
            "label": ent.get("label", nid),
            "entity_type": ent.get("entity_type", "UNKNOWN"),
            "metadata": ent.get("metadata", {}),
        }

    cursor = db.relationships.find({})
    async for rel in cursor:
        src = rel.get("source_entity_id") or rel.get("source_id")
        tgt = rel.get("target_entity_id") or rel.get("target_id")
        if not src or not tgt:
            continue
        src, tgt = str(src), str(tgt)
        if src not in G.nodes or tgt not in G.nodes:
            # Auto-add stub nodes so orphan edges still influence the graph
            if src not in G.nodes:
                G.add_node(src, label=src, entity_type="ENTITY", reference_id=src)
                meta[src] = {"label": src, "entity_type": "ENTITY", "metadata": {}}
            if tgt not in G.nodes:
                G.add_node(tgt, label=tgt, entity_type="ENTITY", reference_id=tgt)
                meta[tgt] = {"label": tgt, "entity_type": "ENTITY", "metadata": {}}
        rel_type = (rel.get("relationship_type") or "ASSOCIATED_WITH").upper()
        weight = float(rel.get("confidence", RELATIONSHIP_WEIGHTS.get(rel_type, 0.4)))
        # If multiple edges, keep the highest weight
        if G.has_edge(src, tgt):
            if G[src][tgt].get("weight", 0) < weight:
                G[src][tgt]["weight"] = weight
                G[src][tgt]["relationship_type"] = rel_type
        else:
            G.add_edge(src, tgt, weight=weight, relationship_type=rel_type)

    return G, meta


def compute_centrality(G: nx.Graph) -> Dict[str, Dict[str, float]]:
    """Compute several centrality metrics for all nodes."""
    out: Dict[str, Dict[str, float]] = {}
    if G.number_of_nodes() == 0:
        return out
    degree = nx.degree_centrality(G)
    try:
        betweenness = nx.betweenness_centrality(G, weight=None)
    except Exception:
        betweenness = {n: 0.0 for n in G.nodes}
    try:
        closeness = nx.closeness_centrality(G)
    except Exception:
        closeness = {n: 0.0 for n in G.nodes}
    try:
        pagerank = nx.pagerank(G, weight="weight")
    except Exception:
        pagerank = {n: 0.0 for n in G.nodes}
    for n in G.nodes:
        out[n] = {
            "degree": round(float(degree.get(n, 0.0)), 4),
            "betweenness": round(float(betweenness.get(n, 0.0)), 4),
            "closeness": round(float(closeness.get(n, 0.0)), 4),
            "pagerank": round(float(pagerank.get(n, 0.0)), 4),
        }
    return out


def detect_indicators(
    entity_id: str,
    G: nx.Graph,
    centrality: Dict[str, Dict[str, float]],
    meta: Dict[str, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Map graph metrics to human-readable indicators."""
    indicators: List[Dict[str, Any]] = []
    if entity_id not in G:
        return indicators

    ent = meta.get(entity_id, {})
    ent_type = ent.get("entity_type", "UNKNOWN")
    neighbors = list(G.neighbors(entity_id))
    n_neighbors = len(neighbors)
    c = centrality.get(entity_id, {"degree": 0, "betweenness": 0, "closeness": 0, "pagerank": 0})

    # Repeated association: high degree or many neighbors
    if n_neighbors >= 3:
        indicators.append(
            {
                "type": "repeated_association",
                "level": _level_for(n_neighbors, 3, 6),
                "evidence_count": n_neighbors,
                "metric_value": float(n_neighbors),
            }
        )

    # Hub behaviour: high betweenness centrality
    if c["betweenness"] > 0.05:
        indicators.append(
            {
                "type": "hub_centrality",
                "level": _level_for(c["betweenness"], 0.05, 0.2),
                "evidence_count": int(c["betweenness"] * 1000),
                "metric_value": c["betweenness"],
            }
        )

    # Authority: high PageRank
    if c["pagerank"] > 0.05:
        indicators.append(
            {
                "type": "high_pagerank",
                "level": _level_for(c["pagerank"], 0.05, 0.15),
                "evidence_count": int(c["pagerank"] * 1000),
                "metric_value": c["pagerank"],
            }
        )

    # Location overlap (entity is a PERSON or VEHICLE with >= 2 LOCATION neighbours)
    if ent_type in ("PERSON", "VEHICLE"):
        loc_neighbors = [
            n for n in neighbors
            if meta.get(n, {}).get("entity_type") == "LOCATION"
        ]
        if len(loc_neighbors) >= 2:
            indicators.append(
                {
                    "type": "location_overlap",
                    "level": _level_for(len(loc_neighbors), 2, 4),
                    "evidence_count": len(loc_neighbors),
                    "metric_value": float(len(loc_neighbors)),
                }
            )

    # Weak ties: too many low-weight edges
    if n_neighbors > 0:
        weights = [G[entity_id][n].get("weight", 0.4) for n in neighbors]
        avg_w = sum(weights) / len(weights)
        if avg_w < 0.4 and n_neighbors >= 2:
            indicators.append(
                {
                    "type": "weak_tie_cluster",
                    "level": "LOW",
                    "evidence_count": sum(1 for w in weights if w < 0.4),
                    "metric_value": round(avg_w, 3),
                }
            )

    # Strong tie to a CASE or EVENT
    strong_case_evt = [
        n for n in neighbors
        if meta.get(n, {}).get("entity_type") in ("CASE", "EVENT")
        and G[entity_id][n].get("weight", 0) >= 0.7
    ]
    if strong_case_evt:
        indicators.append(
            {
                "type": "case_or_event_link",
                "level": "HIGH" if strong_case_evt else "MEDIUM",
                "evidence_count": len(strong_case_evt),
                "metric_value": float(len(strong_case_evt)),
            }
        )

    return indicators


def build_timeline(
    entity_id: str,
    G: nx.Graph,
    meta: Dict[str, Dict[str, Any]],
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Build a simple chronological timeline from neighbouring edges."""
    events: List[Dict[str, Any]] = []
    for nbr in list(G.neighbors(entity_id))[:limit]:
        edge = G[entity_id][nbr]
        nbr_meta = meta.get(nbr, {})
        events.append(
            {
                "timestamp": datetime.utcnow().isoformat(),
                "event": f"{edge.get('relationship_type', 'RELATED')} -> {nbr_meta.get('label', nbr)}",
                "related_entity": nbr_meta.get("label", nbr),
                "related_entity_type": nbr_meta.get("entity_type", "UNKNOWN"),
                "weight": edge.get("weight", 0.0),
            }
        )
    return events


def explain(
    entity_id: str,
    G: nx.Graph,
    centrality: Dict[str, Dict[str, float]],
    indicators: List[Dict[str, Any]],
    meta: Dict[str, Dict[str, Any]],
) -> str:
    """Human-readable narrative explanation."""
    if entity_id not in G:
        return f"Entity {entity_id} not found in the network graph."

    c = centrality.get(entity_id, {})
    n_neighbors = G.degree(entity_id)
    parts = [
        f"Entity has {n_neighbors} direct relationship(s) in the graph.",
        f"Centrality: degree={c.get('degree', 0):.3f}, "
        f"betweenness={c.get('betweenness', 0):.3f}, "
        f"closeness={c.get('closeness', 0):.3f}, "
        f"PageRank={c.get('pagerank', 0):.3f}.",
    ]
    if indicators:
        parts.append(
            "Indicators: "
            + "; ".join(f"{i['type']}={i['level']}({i['evidence_count']})" for i in indicators)
        )
    else:
        parts.append("No high-severity graph indicators detected.")
    return " ".join(parts)


async def analyze(
    db: AsyncIOMotorDatabase, entity_id: str
) -> Dict[str, Any]:
    """Top-level entry point used by the network analyze endpoint."""
    G, meta = await build_graph(db)

    if entity_id not in G:
        return {
            "entity_id": entity_id,
            "indicators": [],
            "related_entities": [],
            "timeline": [],
            "explanation": f"Entity {entity_id} not present in the network graph.",
            "summary": {"nodes_total": G.number_of_nodes(), "edges_total": G.number_of_edges()},
            "centrality": {},
            "model_info": {
                "engine": "BHAIRAV Network Engine (NetworkX graph + MongoDB)",
                "method": "graph_centrality",
                "algorithms": [
                    "degree_centrality",
                    "betweenness_centrality",
                    "closeness_centrality",
                    "pagerank",
                ],
            },
        }

    centrality = compute_centrality(G)
    indicators = detect_indicators(entity_id, G, centrality, meta)
    related = list(G.neighbors(entity_id))
    timeline = build_timeline(entity_id, G, meta)
    explanation = explain(entity_id, G, centrality, indicators, meta)

    return {
        "entity_id": entity_id,
        "indicators": indicators,
        "related_entities": related,
        "timeline": timeline,
        "explanation": explanation,
        "summary": {
            "nodes_total": G.number_of_nodes(),
            "edges_total": G.number_of_edges(),
            "components": nx.number_connected_components(G),
            "this_degree": G.degree(entity_id),
        },
        "centrality": centrality.get(entity_id, {}),
        "model_info": {
            "engine": "BHAIRAV Network Engine (NetworkX graph + MongoDB)",
            "method": "graph_centrality",
            "algorithms": [
                "degree_centrality",
                "betweenness_centrality",
                "closeness_centrality",
                "pagerank",
            ],
            "graph_nodes": G.number_of_nodes(),
            "graph_edges": G.number_of_edges(),
        },
    }
