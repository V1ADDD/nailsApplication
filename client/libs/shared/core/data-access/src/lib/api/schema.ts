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
  '/api/masters/{id}/favorite': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
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
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
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
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/masters/favorites/ids': {
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
            'application/json': string[];
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
  '/api/masters/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          q?: string;
          categoryId?: string;
          subcategoryId?: string;
          priceFrom?: number;
          priceTo?: number;
          maxDistanceKm?: number;
          minRating?: number;
          online?: boolean;
          verified?: boolean;
          window?: components['schemas']['SearchWindow'];
          city?: string;
          sort?: components['schemas']['SearchSort'];
          lat?: number;
          lng?: number;
          page?: number;
          pageSize?: number;
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
            'application/json': components['schemas']['MasterSearchResponse'];
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
  '/api/masters/{id}/card': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          lat?: number;
          lng?: number;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MasterCardResponse'];
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
  '/api/catalog': {
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
            'application/json': components['schemas']['CategoryResponse'][];
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
  '/api/catalog/suggestions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          q?: string;
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
            'application/json': components['schemas']['SuggestionResponse'][];
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
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    CardServiceResponse: {
      subcategoryId: string;
      name: string;
      price: components['schemas']['PriceResponse'];
      durationMin: number;
    };
    CategoryResponse: {
      id: string;
      name: string;
      specialty: string;
      subcategories: components['schemas']['SubcategoryResponse'][];
    };
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
    MapPinResponse: {
      id: string;
      lat: number;
      lng: number;
      price: null | components['schemas']['PriceResponse'];
      specialty: string;
      online: boolean;
    };
    MasterCardResponse: {
      id: string;
      name: string;
      photoUrl: null | string;
      specialty: string;
      rating: null | number;
      reviewsCount: number;
      experienceYears: number;
      distanceKm: number;
      online: boolean;
      verified: boolean;
      isFavorite: boolean;
      isOwn: boolean;
      headlinePrice: null | components['schemas']['PriceResponse'];
      narrowed: boolean;
      preselectSubcategoryId: null | string;
      services: components['schemas']['CardServiceResponse'][];
      nextFreeSlotAt: null | string;
    };
    MasterSearchResponse: {
      total: number;
      onlineCount: number;
      items: components['schemas']['MasterCardResponse'][];
      pins: components['schemas']['MapPinResponse'][];
    };
    MeResponse: {
      id: string;
      name: string;
      phone: null | string;
      masterId: null | string;
    };
    ModulesResponse: {
      enabled: string[];
    };
    PhoneCodeRequest: {
      phone: string;
    };
    PhoneCodeResponse: {
      codeRequired: boolean;
      codeLength: number;
      resendAfterSeconds: number;
    };
    PriceKind: 'exact' | 'from' | 'free';
    PriceResponse: {
      kind: components['schemas']['PriceKind'];
      amount: null | number;
    };
    SearchSort: 'distance' | 'rating' | 'price' | 'nextSlot' | 'popular';
    SearchWindow: 'today' | 'tomorrow' | 'weekend' | null;
    SignInRequest: {
      phone: string;
      code?: null | string;
      name?: null | string;
    };
    SignInResponse: {
      nameRequired: boolean;
    };
    SubcategoryResponse: {
      id: string;
      name: string;
      addon: boolean;
    };
    SuggestionKind: 'category' | 'subcategory';
    SuggestionResponse: {
      kind: components['schemas']['SuggestionKind'];
      id: string;
      name: string;
      categoryId: string;
      categoryName: string;
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
