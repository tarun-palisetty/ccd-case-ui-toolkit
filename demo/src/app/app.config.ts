import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AbstractAppConfig, CaseEditorConfig } from '@hmcts/ccd-case-ui-toolkit';

@Injectable()
export class AppConfig extends AbstractAppConfig {

  protected config: CaseEditorConfig = {
    'api_url': '/aggregated',
    'case_data_url': '/data',
    'document_management_url': '/documents',
    'login_url': '/login',
    'oauth2_client_id': 'ccd_gateway',
    'postcode_lookup_url': '/addresses?postcode=${postcode}',
    'remote_document_management_url': '/documents',
    'payments_url': '/payments',
    'activity_batch_collection_delay_ms': 1,
    'activity_next_poll_request_ms': 5000,
    'activity_retry': 5,
    'activity_url': '',
    'activity_max_request_per_batch': 25,
    'print_service_url': '/print',
    'remote_print_service_url': '/remote_print'
  };

  constructor(private http: Http) {
    super();
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public getLoginUrl(): string {
    return this.config.login_url;
  }

  public getApiUrl() {
    return this.config.api_url;
  }

  public getCaseDataUrl() {
    return this.config.case_data_url;
  }

  public getDocumentManagementUrl() {
    return this.config.document_management_url;
  }

  public getRemoteDocumentManagementUrl() {
    return this.config.remote_document_management_url;
  }

  public getPostcodeLookupUrl() {
    return this.config.postcode_lookup_url;
  }

  public getOAuth2ClientId() {
    return this.config.oauth2_client_id;
  }

  public getPaymentsUrl() {
    return this.config.payments_url;
  }

  public getCaseHistoryUrl(caseId: string, eventId: string) {
    return this.getCaseDataUrl()
      + `/internal`
      + `/cases/${caseId}`
      + `/events/${eventId}`;
  }

  public getCreateOrUpdateDraftsUrl(ctid: string) {
    return this.getCaseDataUrl() + `/case-types/${ctid}/drafts/`;
  }

  public getViewOrDeleteDraftsUrl(did: string) {
    return this.getCaseDataUrl() + `/drafts/${did}`;
  }

  public getActivityUrl() {
    return this.config.activity_url;
  }

  public getActivityNexPollRequestMs() {
    return this.config.activity_next_poll_request_ms;
  }

  public getActivityRetry() {
    return this.config.activity_retry;
  }

  public getActivityBatchCollectionDelayMs() {
    return this.config.activity_batch_collection_delay_ms;
  }

  public getActivityMaxRequestPerBatch() {
    return this.config.activity_max_request_per_batch;
  }

  public getPrintServiceUrl() {
    return this.config.print_service_url;
  }

  public getRemotePrintServiceUrl() {
    return this.config.remote_print_service_url;
  }

}
