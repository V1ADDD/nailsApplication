export interface paths {
  '/api/modules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['GetModules'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/support/tickets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CreateSupportTicketRequest'];
          'application/*+json': components['schemas']['CreateSupportTicketRequest'];
        };
      };
      responses: {
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateSupportTicketResponse'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/sign-in/code': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['PhoneCodeRequest'];
          'application/*+json': components['schemas']['PhoneCodeRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PhoneCodeResponse'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/sign-in': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['SignInRequest'];
          'application/*+json': components['schemas']['SignInRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SignInResponse'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/sign-out': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MeResponse'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/help/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          language?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HelpContentResponse'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/help/images/{language}/{articleId}/{fileName}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          language: string;
          articleId: string;
          fileName: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    CreateSupportTicketRequest: {
      text: string;
      contact?: null | string;
    };
    CreateSupportTicketResponse: {
      ticketId: string;
    };
    HelpArticleResponse: {
      id: string;
      title: string;
      summary: null | string;
      keywords: string[];
      blocks: components['schemas']['HelpBlockResponse'][];
    };
    HelpBlockResponse: {
      type: components['schemas']['HelpBlockType'];
      text: null | string;
      tone: null | components['schemas']['HelpNoteTone'];
      items: null | string[];
      articleIds: null | string[];
      image: null | components['schemas']['HelpImageResponse'];
    };
    HelpBlockType: 'heading' | 'paragraph' | 'list' | 'steps' | 'note' | 'related' | 'image';
    HelpCompanyResponse: {
      name: string;
      email: string;
      website: string;
    };
    HelpContentResponse: {
      site: components['schemas']['HelpSiteResponse'];
      company: components['schemas']['HelpCompanyResponse'];
      sections: components['schemas']['HelpSectionResponse'][];
    };
    HelpImageResponse: {
      url: string;
      alt: string;
      caption: null | string;
      width: number;
      height: number;
    };
    HelpNoteTone: 'info' | 'tip' | 'warning' | null;
    HelpSectionResponse: {
      id: string;
      title: string;
      articles: components['schemas']['HelpArticleResponse'][];
    };
    HelpSiteResponse: {
      title: string;
      description: string;
    };
    MeResponse: {
      id: string;
      name: string;
      phone: null | string;
    };
    ModulesResponse: {
      enabled: string[];
    };
    PhoneCodeRequest: {
      phone: string;
    };
    PhoneCodeResponse: {
      codeLength: number;
      resendAfterSeconds: number;
    };
    SignInRequest: {
      phone: string;
      code: string;
      name?: null | string;
    };
    SignInResponse: {
      nameRequired: boolean;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  GetModules: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ModulesResponse'];
        };
      };
    };
  };
}
