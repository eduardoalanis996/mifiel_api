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

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})


Route.post('/sign_callback_url', async ({request, response})=>{
  console.log('sign_callback_url')
  console.log( request.body())
})

Route.post('/callback_url', async ({request, response})=>{
  console.log('callback_url')
  console.log( request.body())
})

Route.post('/documents', 'DocumentsController.store')
Route.get('/documents', 'DocumentsController.index')