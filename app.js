const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cons = require('consolidate');

const indexRouter = require('./routes/index')

const port = process.env.PORT || 5000
//Смотрим какой у нас путь до статике(соединение текущего положение с папкой клиент)
const pathClient = path.join(__dirname,'client')


//Создаём приложение
const app = express();
//Используем парсер, чтобы принимать post запросы
app.use(bodyParser.json())
//Обращение к апи
app.use('/', indexRouter)


// view engine setup
app.engine('html', cons.swig)
app.set('views', pathClient);
app.set('view engine', 'html');
//Указываем серверу папку со статикой
app.use(express.static(pathClient))

// app.get('/',)
//Слушаем такой то порт
app.listen(port, ()=>{
    console.log(`Вы слушаете на порту ${port}`)
})

