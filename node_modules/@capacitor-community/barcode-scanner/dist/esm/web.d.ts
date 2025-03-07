import { WebPlugin } from '@capacitor/core';
import { BarcodeScannerPlugin, ScanOptions, ScanResult, CheckPermissionOptions, CheckPermissionResult, StopScanOptions, TorchStateResult } from './definitions';
export declare class BarcodeScannerWeb extends WebPlugin implements BarcodeScannerPlugin {
    private _formats;
    private _controls;
    private _torchState;
    private _video;
    private _options;
    private _backgroundColor;
    prepare(): Promise<void>;
    hideBackground(): Promise<void>;
    showBackground(): Promise<void>;
    startScan(_options: ScanOptions): Promise<ScanResult>;
    startScanning(_options: ScanOptions, _callback: any): Promise<string>;
    pauseScanning(): Promise<void>;
    resumeScanning(): Promise<void>;
    stopScan(_options?: StopScanOptions): Promise<void>;
    checkPermission(_options: CheckPermissionOptions): Promise<CheckPermissionResult>;
    openAppSettings(): Promise<void>;
    disableTorch(): Promise<void>;
    enableTorch(): Promise<void>;
    toggleTorch(): Promise<void>;
    getTorchState(): Promise<TorchStateResult>;
    private _getVideoElement;
    private _getFirstResultFromReader;
    private _startVideo;
    private _stop;
}
