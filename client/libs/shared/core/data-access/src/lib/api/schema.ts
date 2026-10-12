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
  '/api/masters/bookings/conflicts': {
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
          'application/json': components['schemas']['ConflictsRequest'];
          'application/*+json': components['schemas']['ConflictsRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ConflictsResponse'];
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
  '/api/masters/bookings': {
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
          'application/json': components['schemas']['CreateBookingRequest'];
          'application/*+json': components['schemas']['CreateBookingRequest'];
        };
      };
      responses: {
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateBookingResponse'];
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
  '/api/masters/bookings/{id}/confirm': {
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
            'application/json': components['schemas']['BookingResponse'];
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
  '/api/masters/bookings/{id}/cancel': {
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
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CancelBookingRequest'];
          'application/*+json': components['schemas']['CancelBookingRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BookingResponse'];
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
  '/api/masters/{id}': {
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
            'application/json': components['schemas']['MasterProfileResponse'];
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
  '/api/masters/{id}/slots': {
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
            'application/json': components['schemas']['SlotsResponse'];
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
  '/api/masters/{id}/reviews': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          page?: number;
          pageSize?: number;
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
            'application/json': components['schemas']['PagedResponseOfReviewResponse'];
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
    BookingResponse: {
      id: string;
      masterId: string;
      clientUserId: null | string;
      slotId: null | string;
      subcategoryId: string;
      serviceName: string;
      price: components['schemas']['PriceResponse'];
      start: string;
      durationMin: number;
      address: string;
      status: components['schemas']['BookingStatus'];
      source: components['schemas']['BookingSource'];
      createdBy: components['schemas']['Party'];
      confirmedAt: null | string;
      releaseAt: null | string;
      cancelledAt: null | string;
      cancelledBy: null | components['schemas']['Party'];
      cancelReason: null | string;
      cancelMutual: boolean;
      cancelExpired: boolean;
      masterName: string;
      masterPhotoUrl: null | string;
      clientName: string;
    };
    BookingSource: 'site' | 'external';
    BookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'noShow';
    BookingSummaryResponse: {
      id: string;
      masterName: string;
      serviceName: string;
      start: string;
      durationMin: number;
      address: string;
    };
    CancelBookingRequest: {
      reason: string;
      mutual?: boolean;
    };
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
    ConflictsRequest: {
      slotId: string;
    };
    ConflictsResponse: {
      overlapping: components['schemas']['BookingSummaryResponse'][];
      tooClose: components['schemas']['BookingSummaryResponse'][];
    };
    ContactsResponse: {
      phone: string;
      email: null | string;
      telegram: null | string;
      viber: null | string;
      instagram: null | string;
    };
    CourseResponse: {
      title: string;
      school: string;
      year: number;
    };
    CreateBookingRequest: {
      masterId: string;
      slotId: string;
      subcategoryId: string;
    };
    CreateBookingResponse: {
      booking: components['schemas']['BookingResponse'];
      autoCancelled: components['schemas']['BookingSummaryResponse'][];
      tooClose: components['schemas']['BookingSummaryResponse'][];
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
    MasterProfileResponse: {
      id: string;
      name: string;
      photoUrl: null | string;
      specialty: string;
      categoryIds: string[];
      city: string;
      district: string;
      address: string;
      lat: number;
      lng: number;
      distanceKm: number;
      rating: null | number;
      reviewsCount: number;
      experienceYears: number;
      verified: boolean;
      online: boolean;
      about: string;
      courses: components['schemas']['CourseResponse'][];
      contacts: components['schemas']['ContactsResponse'];
      services: components['schemas']['ProfileServiceResponse'][];
      portfolio: components['schemas']['PortfolioPhotoResponse'][];
      headlinePrice: null | components['schemas']['PriceResponse'];
      bookingsCount: number;
      isFavorite: boolean;
      isOwn: boolean;
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
    PagedResponseOfReviewResponse: {
      items: components['schemas']['ReviewResponse'][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    Party: 'client' | 'master';
    PhoneCodeRequest: {
      phone: string;
    };
    PhoneCodeResponse: {
      codeRequired: boolean;
      codeLength: number;
      resendAfterSeconds: number;
    };
    PortfolioPhotoResponse: {
      id: string;
      url: null | string;
      hue: number;
      caption: null | string;
    };
    PriceKind: 'exact' | 'from' | 'free';
    PriceResponse: {
      kind: components['schemas']['PriceKind'];
      amount: null | number;
    };
    ProfileServiceResponse: {
      id: string;
      subcategoryId: string;
      categoryId: string;
      name: string;
      price: components['schemas']['PriceResponse'];
      durationMin: number;
    };
    ReviewResponse: {
      id: string;
      subcategoryId: string;
      serviceName: string;
      rating: number;
      text: string;
      date: string;
      authorName: string;
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
    SlotEntryResponse: {
      start: string;
      durationMin: number;
      status: components['schemas']['SlotEntryStatus'];
      slotId: null | string;
    };
    SlotEntryStatus: 'free' | 'pending' | 'busy';
    SlotsResponse: {
      days: number;
      items: components['schemas']['SlotEntryResponse'][];
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
