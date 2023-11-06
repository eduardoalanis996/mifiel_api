/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import XMLService from 'App/Services/XMLService'
import Application from '@ioc:Adonis/Core/Application'

import Route from '@ioc:Adonis/Core/Route'

Route.post('/sign_callback_url', 'DocumentsController.signCallback')

Route.post('/callback_url', 'DocumentsController.callback')

Route.post('/documents', 'DocumentsController.store')

Route.get('/documents', 'DocumentsController.index')

Route.get('/documents/:widgetId', 'DocumentsController.show')

Route.get('/documents/download/:documentId', 'DocumentsController.downloadContract')
