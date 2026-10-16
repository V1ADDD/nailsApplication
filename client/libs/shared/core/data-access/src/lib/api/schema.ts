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
  '/api/media': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['UploadMedia'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/media/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['GetMedia'];
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
  '/api/masters/bookings/{id}': {
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
            'application/json': components['schemas']['MyBookingResponse'];
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
  '/api/masters/bookings/{id}/reviews': {
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
          'application/json': components['schemas']['WriteReviewRequest'];
          'application/*+json': components['schemas']['WriteReviewRequest'];
        };
      };
      responses: {
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReviewResponse'];
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
  '/api/masters/bookings/{id}/move': {
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
          'application/json': components['schemas']['MoveBookingRequest'];
          'application/*+json': components['schemas']['MoveBookingRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MyBookingResponse'];
          };
        };
      };
    };
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
          content: {
            'application/json': components['schemas']['MyBookingResponse'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/masters/bookings/{id}/move/accept': {
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
  '/api/masters/bookings/{id}/move/decline': {
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
  '/api/masters/cities': {
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
  '/api/masters/me': {
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
          'application/json': components['schemas']['BecomeMasterRequest'];
          'application/*+json': components['schemas']['BecomeMasterRequest'];
        };
      };
      responses: {
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MeResponse'];
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
  '/api/masters/bookings/mine': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          scope?: components['schemas']['MyBookingsScope'];
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
            'application/json': components['schemas']['PagedResponseOfMyBookingResponse'];
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
  '/api/masters/reviews/mine': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: {
          about?: boolean;
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
            'application/json': components['schemas']['MyReviewsResponse'];
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
  '/api/masters/favorites': {
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
            'application/json': components['schemas']['PagedResponseOfFavoriteMasterResponse'];
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
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['UpdateProfileRequest'];
          'application/*+json': components['schemas']['UpdateProfileRequest'];
        };
      };
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
    trace?: never;
  };
  '/api/identity/me/notifications': {
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
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['NotificationSettingsRequest'];
          'application/*+json': components['schemas']['NotificationSettingsRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotificationSettingsResponse'];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/me/phone/code': {
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
          'application/json': components['schemas']['PhoneChangeCodeRequest'];
          'application/*+json': components['schemas']['PhoneChangeCodeRequest'];
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
  '/api/identity/me/phone': {
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
          'application/json': components['schemas']['PhoneChangeRequest'];
          'application/*+json': components['schemas']['PhoneChangeRequest'];
        };
      };
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
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/identity/sign-out/others': {
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
  '/api/identity/mode': {
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
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['SetModeRequest'];
          'application/*+json': components['schemas']['SetModeRequest'];
        };
      };
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
  '/api/chats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['ChatSummaryResponse'][];
          };
        };
      };
    };
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
          'application/json': components['schemas']['StartChatRequest'];
          'application/*+json': components['schemas']['StartChatRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['StartChatResponse'];
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
  '/api/chats/unread': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['UnreadResponse'];
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
  '/api/chats/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['ChatThreadResponse'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
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
          content?: never;
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/chats/{id}/read': {
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
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['ReadResponse'];
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
  '/api/chats/{id}/block': {
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
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['ChatResponse'];
          };
        };
      };
    };
    delete: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
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
            'application/json': components['schemas']['ChatResponse'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/chats/{id}/messages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
          before?: string;
          limit?: number;
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
            'application/json': components['schemas']['MessagesPageResponse'];
          };
        };
      };
    };
    put?: never;
    post: {
      parameters: {
        query: {
          role: components['schemas']['ChatRole'];
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['SendMessageRequest'];
          'application/*+json': components['schemas']['SendMessageRequest'];
        };
      };
      responses: {
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MessageResponse'];
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
  '/api/chats/messages/{messageId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          messageId: string;
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
            'application/json': components['schemas']['MessageResponse'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          messageId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['EditMessageRequest'];
          'application/*+json': components['schemas']['EditMessageRequest'];
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['MessageResponse'];
          };
        };
      };
    };
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
    BecomeMasterRequest: {
      categoryId: null | string;
      city: null | string;
      address: null | string;
    };
    BookingCard: {
      id: string;
      masterId: string;
      clientUserId: null | string;
      subcategoryId: string;
      serviceName: string;
      price: components['schemas']['PriceResponse'];
      start: string;
      durationMin: number;
      status: components['schemas']['BookingStatus'];
      createdBy: components['schemas']['Party'];
      cancelledBy: null | components['schemas']['Party'];
      cancelReason: null | string;
      cancelMutual: boolean;
      cancelExpired: boolean;
      releaseAt: null | string;
      move: null | components['schemas']['BookingMoveCard'];
    };
    BookingChangedEvent: {
      booking: {
        id: string;
        masterId: string;
        clientUserId: null | string;
        subcategoryId: string;
        serviceName: string;
        price: {
          kind: 'exact' | 'from' | 'free';
          amount: null | number;
        };
        start: string;
        durationMin: number;
        status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'noShow';
        createdBy: 'client' | 'master';
        cancelledBy: 'client' | 'master' | null;
        cancelReason: null | string;
        cancelMutual: boolean;
        cancelExpired: boolean;
        releaseAt: null | string;
        move: {
          start: string;
          durationMin: number;
          lapsesAt: string;
          status: 'open' | 'accepted' | 'declined' | 'withdrawn' | 'cancelled' | 'lapsed';
        };
      };
    };
    BookingMoveCard: {
      start: string;
      durationMin: number;
      lapsesAt: string;
      status: components['schemas']['BookingMoveStatus'];
    };
    BookingMoveStatus: 'open' | 'accepted' | 'declined' | 'withdrawn' | 'cancelled' | 'lapsed';
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
    ChatChangedEvent: {
      chatId: string;
      blockedBy: 'client' | 'master' | null;
    };
    ChatReadEvent: {
      chatId: string;
      role: 'client' | 'master';
      readAt: string;
    };
    ChatResponse: {
      id: string;
      blockedBy: null | components['schemas']['ChatRole'];
      otherReadAt: string;
    };
    ChatRole: 'client' | 'master' | null;
    ChatSummaryResponse: {
      chatId: string;
      counterpart: components['schemas']['CounterpartResponse'];
      lastMessage: null | components['schemas']['MessageResponse'];
      lastMessagePreview: string;
      lastActivityAt: string;
      unread: number;
      blockedBy: null | components['schemas']['ChatRole'];
    };
    ChatThreadResponse: {
      chat: components['schemas']['ChatResponse'];
      counterpart: components['schemas']['CounterpartResponse'];
      messages: components['schemas']['MessageResponse'][];
      bookings: components['schemas']['BookingCard'][];
      hasOlder: boolean;
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
    CounterpartResponse: {
      id: string;
      name: string;
      photoUrl: null | string;
      isMaster: boolean;
      online: boolean;
      subtitle: null | string;
      deleted: boolean;
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
    EditMessageRequest: {
      text?: string;
    };
    FavoriteMasterResponse: {
      id: string;
      name: string;
      photoUrl: null | string;
      specialty: string;
      rating: null | number;
      reviewsCount: number;
      verified: boolean;
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
    IFormFile: string;
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
      replyMinutes: null | number;
    };
    MasterSearchResponse: {
      total: number;
      onlineCount: number;
      items: components['schemas']['MasterCardResponse'][];
      pins: components['schemas']['MapPinResponse'][];
    };
    MediaResponse: {
      id: string;
      url: string;
    };
    MeResponse: {
      id: string;
      name: string;
      phone: null | string;
      masterId: null | string;
      mode: components['schemas']['UserMode'];
      heartbeatSeconds: number;
      email: null | string;
      photoUrl: null | string;
      telegram: null | string;
      viber: null | string;
      preferredContact: components['schemas']['PreferredContact'];
      notifications: components['schemas']['NotificationSettingsResponse'];
    };
    MessageCreatedEvent: {
      chatId: string;
      message: {
        id: string;
        kind: 'text' | 'booking' | 'system';
        authorRole: 'client' | 'master' | null;
        text: null | string;
        mediaUrl: null | string;
        bookingId: null | string;
        sentAt: string;
        editedAt: null | string;
        deleted: boolean;
      };
      preview: string;
      masterUserId: string;
      clientUserId: string;
    };
    MessageKind: 'text' | 'booking' | 'system';
    MessageResponse: {
      id: string;
      kind: components['schemas']['MessageKind'];
      authorRole: null | components['schemas']['ChatRole'];
      text: null | string;
      mediaUrl: null | string;
      bookingId: null | string;
      sentAt: string;
      editedAt: null | string;
      deleted: boolean;
    };
    MessagesPageResponse: {
      items: components['schemas']['MessageResponse'][];
      hasOlder: boolean;
    };
    MessageUpdatedEvent: {
      chatId: string;
      message: {
        id: string;
        kind: 'text' | 'booking' | 'system';
        authorRole: 'client' | 'master' | null;
        text: null | string;
        mediaUrl: null | string;
        bookingId: null | string;
        sentAt: string;
        editedAt: null | string;
        deleted: boolean;
      };
      preview: string;
    };
    ModeChangedEvent: {
      mode: 'client' | 'master';
    };
    ModulesResponse: {
      enabled: string[];
    };
    MoveBookingRequest: {
      slotId: null | string;
    };
    MyBookingResponse: {
      booking: components['schemas']['BookingResponse'];
      upcoming: boolean;
      canReview: boolean;
      myReview: null | components['schemas']['MyReview'];
      move: null | components['schemas']['BookingMoveCard'];
    };
    MyBookingsScope: 'upcoming' | 'past';
    MyReview: {
      rating: number;
      text: string;
      date: string;
    };
    MyReviewResponse: {
      id: string;
      masterId: string;
      masterName: string;
      masterPhotoUrl: null | string;
      serviceName: string;
      rating: number;
      text: string;
      date: string;
    };
    MyReviewsResponse: {
      writtenCount: number;
      aboutCount: number;
      items: components['schemas']['MyReviewResponse'][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    NotificationSettingsRequest: {
      push?: boolean;
      email?: boolean;
      site?: boolean;
      reminders?: boolean;
    };
    NotificationSettingsResponse: {
      push: boolean;
      email: boolean;
      site: boolean;
      reminders: boolean;
    };
    PagedResponseOfFavoriteMasterResponse: {
      items: components['schemas']['FavoriteMasterResponse'][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfMyBookingResponse: {
      items: components['schemas']['MyBookingResponse'][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfReviewResponse: {
      items: components['schemas']['ReviewResponse'][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    Party: 'client' | 'master';
    PhoneChangeCodeRequest: {
      phone: string;
    };
    PhoneChangeRequest: {
      phone: string;
      code?: null | string;
    };
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
    PreferredContact: 'messages' | 'phone';
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
    ReadResponse: {
      readAt: string;
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
    SendMessageRequest: {
      text?: null | string;
      mediaUrl?: null | string;
    };
    SetModeRequest: {
      mode: components['schemas']['UserMode'];
    };
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
    StartChatRequest: {
      masterId?: null | string;
      clientId?: null | string;
    };
    StartChatResponse: {
      chatId: string;
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
    UnreadChangedEvent: {
      role: 'client' | 'master';
      count: number;
    };
    UnreadResponse: {
      count: number;
    };
    UpdateProfileRequest: {
      name?: null | string;
      email?: null | string;
      photoUrl?: null | string;
      telegram?: null | string;
      viber?: null | string;
      preferredContact?: null | components['schemas']['PreferredContact'];
    };
    UserMode: 'client' | 'master';
    WriteReviewRequest: {
      rating: null | number;
      text?: null | string;
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
  UploadMedia: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': {
          file: components['schemas']['IFormFile'];
        };
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MediaResponse'];
        };
      };
    };
  };
  GetMedia: {
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
}
