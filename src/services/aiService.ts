/**
 * Bhairav AI Service
 * 
 * Service for interacting with AI/ML video processing endpoints.
 */

import type {
  CameraSession,
  InferenceResult,
  ModelStatus,
  WebSocketMessage
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';

class AIService {
  /**
   * Create a new camera processing session
   */
  async createCameraSession(
    cameraId: string,
    sourceType: 'RTSP_STREAM' | 'VIDEO_FILE' | 'WEBCAM',
    sourceUrl: string,
    config?: Record<string, any>
  ): Promise<CameraSession> {
    const response = await fetch(`${API_BASE_URL}/ai/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        camera_id: cameraId,
        source_type: sourceType,
        source_url: sourceUrl,
        config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create camera session');
    }

    return response.json();
  }

  /**
   * Stop a camera processing session
   */
  async stopCameraSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to stop camera session');
    }
  }

  /**
   * Get session information
   */
  async getSessionInfo(sessionId: string): Promise<CameraSession> {
    const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get session info');
    }

    return response.json();
  }

  /**
   * Get all active sessions
   */
  async getAllSessions(): Promise<CameraSession[]> {
    const response = await fetch(`${API_BASE_URL}/ai/sessions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get sessions');
    }

    return response.json();
  }

  /**
   * Process a single frame for a session
   */
  async processSessionFrame(sessionId: string): Promise<InferenceResult> {
    const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to process frame');
    }

    return response.json();
  }

  /**
   * Get AI engine status
   */
  async getAIStatus(): Promise<{ model_info: ModelStatus; processor_metrics: Record<string, any> }> {
    const response = await fetch(`${API_BASE_URL}/ai/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get AI status');
    }

    return response.json();
  }

  /**
   * Analyze a video file
   */
  async analyzeVideoFile(
    cameraId: string,
    filePath: string,
    config?: Record<string, any>
  ): Promise<{
    session_id: string;
    frames_processed: number;
    sample_results: InferenceResult[];
    total_events: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/ai/video/analyze-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        camera_id: cameraId,
        file_path: filePath,
        config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze video file');
    }

    return response.json();
  }

  /**
   * Create WebSocket connection for real-time AI events
   */
  createWebSocketConnection(
    onMessage: (message: WebSocketMessage) => void,
    cameraId?: string,
    onError?: (error: Event) => void,
    onClose?: () => void
  ): WebSocket {
    const token = localStorage.getItem('token');
    const wsUrl = cameraId
      ? `ws://127.0.0.1:5000/ws/camera/${cameraId}?token=${token}`
      : `ws://127.0.0.1:5000/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    ws.onclose = () => {
      onClose?.();
    };

    return ws;
  }
}

export const aiService = new AIService();
