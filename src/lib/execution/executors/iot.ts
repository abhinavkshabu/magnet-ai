/**
 * IoT node executor
 * Handles IoT device interactions
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';

export class IoTExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get IoT configuration
      const deviceId = node.content?.deviceId as string;
      const action = node.content?.action as string;
      const protocol = (node.content?.protocol as string) || 'mqtt';
      const payload = node.content?.payload || context.input;

      if (!deviceId) {
        return this.error('Device ID is required for IoT node');
      }

      if (!action) {
        return this.error('Action is required for IoT node');
      }

      // Simulate IoT interaction based on protocol
      let result;
      
      switch (protocol.toLowerCase()) {
        case 'mqtt':
          result = await this.executeMQTT(deviceId, action, payload);
          break;
        case 'http':
          result = await this.executeHTTP(deviceId, action, payload);
          break;
        case 'coap':
          result = await this.executeCoAP(deviceId, action, payload);
          break;
        default:
          return this.error(`Unsupported IoT protocol: ${protocol}`);
      }

      const duration = Date.now() - startTime;

      return this.success(result, {
        duration,
        deviceId,
        action,
        protocol,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.error(
        `IoT execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration }
      );
    }
  }

  /**
   * Execute MQTT command
   */
  private async executeMQTT(
    deviceId: string,
    action: string,
    payload: any
  ): Promise<any> {
    // TODO: Implement real MQTT client
    // For now, simulate the interaction
    console.log(`[MQTT] Device: ${deviceId}, Action: ${action}`, payload);
    
    return {
      protocol: 'mqtt',
      deviceId,
      action,
      status: 'success',
      message: `MQTT command sent to ${deviceId}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute HTTP command to IoT device
   */
  private async executeHTTP(
    deviceId: string,
    action: string,
    payload: any
  ): Promise<any> {
    // TODO: Implement real HTTP client for IoT devices
    // This would typically call a device's REST API
    console.log(`[HTTP] Device: ${deviceId}, Action: ${action}`, payload);
    
    return {
      protocol: 'http',
      deviceId,
      action,
      status: 'success',
      message: `HTTP command sent to ${deviceId}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute CoAP command
   */
  private async executeCoAP(
    deviceId: string,
    action: string,
    payload: any
  ): Promise<any> {
    // TODO: Implement real CoAP client
    console.log(`[CoAP] Device: ${deviceId}, Action: ${action}`, payload);
    
    return {
      protocol: 'coap',
      deviceId,
      action,
      status: 'success',
      message: `CoAP command sent to ${deviceId}`,
      timestamp: new Date().toISOString(),
    };
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    const errors = baseValidation.errors || [];

    if (!node.content?.deviceId) {
      errors.push('Device ID is required for IoT node');
    }

    if (!node.content?.action) {
      errors.push('Action is required for IoT node');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
