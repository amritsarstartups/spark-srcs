import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    children: [],
  },

  {
    path: '',
    // add authentication here,
    children: [
      {
        path: 'books',
        // component: BooksListPageComponent
      },

      {
        path: 'books/:bookId',
        // component: BookDetailPageComponent
      },

      {
        path: 'locations',
        // component: LocationsListPageComponent
      },

      {
        path: 'locations/:locationId',
        // component: LocationDetailPageComponent
      },

      {
        path: 'user/me',
        // component: UserProfilePageComponent
      },
    ],
  },
];

/*
# Routes

## user

- `/books`
- `/books/{bookId}`
- `/locations`
- `/locations/{locId}`
- `/users/me`

## admin

- `/admin/locations`
- `/admin/locations/{locId}`
- `/users/{userId}`
- `/books`
- `/books/{bookId}`
- `/books/{bookId}/{bookItemId}`
*/
