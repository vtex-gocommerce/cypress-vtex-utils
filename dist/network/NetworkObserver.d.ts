import Protocol from 'devtools-protocol';
import ProtocolMapping from 'devtools-protocol/types/protocol-mapping';
import { ChromeRemoteInterface } from 'chrome-remote-interface';
import { Logger } from '../utils';
import { NetworkRequest } from './NetworkRequest';
export declare type ChromeRemoteInterfaceMethod = keyof ProtocolMapping.Events;
export declare type ChromeRemoteInterfaceEvent = {
    method: ChromeRemoteInterfaceMethod;
    params?: ProtocolMapping.Events[ChromeRemoteInterfaceMethod][0];
};
export declare class NetworkObserver {
    private readonly chromeRemoteInterface;
    private readonly logger;
    private readonly options;
    private readonly _entries;
    private readonly network;
    private destination;
    constructor(chromeRemoteInterface: ChromeRemoteInterface, logger: Logger, options: {
        stubPath: string;
    });
    subscribe(callback: (chromeEntry: NetworkRequest) => void): Promise<void>;
    signedExchangeReceived(params: Protocol.Network.SignedExchangeReceivedEvent): void;
    requestWillBeSent({ type, loaderId, initiator, redirectResponse, documentURL, frameId, timestamp, requestId, request, wallTime }: Protocol.Network.RequestWillBeSentEvent): void;
    dataReceived({ requestId, dataLength, encodedDataLength, timestamp }: Protocol.Network.DataReceivedEvent): void;
    responseReceived({ requestId, response, timestamp, type }: Protocol.Network.ResponseReceivedEvent): void;
    resourceChangedPriority({ requestId, newPriority }: Protocol.Network.ResourceChangedPriorityEvent): void;
    loadingFinished({ requestId, timestamp, encodedDataLength }: Protocol.Network.LoadingFinishedEvent): Promise<void>;
    loadingFailed({ requestId, errorText, canceled, type, timestamp }: Protocol.Network.LoadingFailedEvent): void;
    webSocketCreated({ initiator, requestId, url }: Protocol.Network.WebSocketCreatedEvent): void;
    webSocketWillSendHandshakeRequest({ request, requestId, timestamp, wallTime }: Protocol.Network.WebSocketWillSendHandshakeRequestEvent): void;
    webSocketHandshakeResponseReceived({ timestamp, response, requestId }: Protocol.Network.WebSocketHandshakeResponseReceivedEvent): void;
    webSocketFrameSent({ requestId, timestamp, response }: Protocol.Network.WebSocketFrameSentEvent): void;
    webSocketFrameReceived({ requestId, timestamp, response }: Protocol.Network.WebSocketFrameReceivedEvent): void;
    webSocketFrameError({ errorMessage, requestId, timestamp }: Protocol.Network.WebSocketFrameErrorEvent): void;
    webSocketClosed({ requestId, timestamp }: Protocol.Network.WebSocketClosedEvent): void;
    requestWillBeSentExtraInfo({ requestId, headers }: Protocol.Network.RequestWillBeSentExtraInfoEvent): void;
    responseReceivedExtraInfo({ requestId, headers, headersText }: Protocol.Network.ResponseReceivedExtraInfoEvent): void;
    private _appendRedirect;
    private finishRequest;
    private startRequest;
    private updateNetworkRequestWithRequest;
    private createRequest;
    private stripStubPathFromUrl;
    private updateNetworkRequestWithResponse;
    private headersMapToHeadersArray;
    private handleEvent;
}
