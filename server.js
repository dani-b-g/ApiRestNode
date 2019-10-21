var express = require('express')
var bodyParser=require('body-parser')
var multer=require('multer')
var neo4j= require('neo4j-driver').v1
require('dotenv').config();
var http = require('http')


var app = express()
var upload=multer();

const port = process.env.PORT|| 8005;
const dateUp = Date.now();

const driver = neo4j.driver('bolt://'+process.env.IPDB+':'+process.env.DBPRT, neo4j.auth.basic(process.env.USER, process.env.PASS))
const session = driver.session()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// app.get('/', (req, res) => {
//   res.status(200).send("Welcome to API REST")
// })
// http.createServer(app).listen(8005, () => {
//   console.log('Server start on http://localhost:8005');
// });
app.get('/', (req, res) => {
  const today = new Date();

  res.json({
    date: today,
    up: `${(Date.now() - dateUp)/1000} seg.`,
  });
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
  console.log('Press CTRL + C to quit');
});

app.post('/data/:app',(req,res)=>{
    var data=['Flow1',req.params.app]
    res.send(data)
})

app.post('/flows/:app',(req,res)=>{
    var resultado=[]
      session.run(
        'MATCH(n:Flow) RETURN n',
        { message: 'hello, world' }
      ).then(result=>{
        driver.close()
        console.log(result.records.length);
        // console.log(result.records.get(0));
        
        // res.send(result.records.map.get(0))
        return result.records.map(record =>{
            // console.log(record.get(0,"properties"))
            resultado.push(record.get(0))
            // console.log(resultado);
            
        })
    }).then(()=>{
        res.send(resultado);
        session.close()    
    })
})

app.post('/json/query', upload.array(),(req,res)=>{
  var resultado=[]
  console.log(req.headers.auth);
  
  if (tokenChek(req.headers.auth)) {
  if (Object.keys(req.body).length !== 0 && req.body.statements.query.length !== 0) {
    var query=req.body.statements.query
    session.run(query).then(
      result=>{
        driver.close()
        return result.records.map(record=>{
          resultado.push(record.get(0))
        })
      }
    ).catch(()=>{
      resultado={
        "Error":"Error en ejecucion de Query",
        "Query":query||'N/A'
      }
    }).then(()=>{
      if (resultado.length<=0) {
        resultado={
          "Feed":"No hay Datos",
          "Query":query||'N/A'
        }
      }
      if ("Error" in resultado) {
        res.status(500).send(resultado)
      }else{
        res.status(200).send(resultado)
      }
    })
  }else{
    resultado={
      "Feed":"No se ha enviado ningun body",
      "Query":'N/A'
    }
    res.status(400).send(resultado)
  }
  session.close()
}else{
  resultado={
    "OK":false,
    "message":"Unauthorized"
  }
  res.status(401).send(resultado)
}
})

function tokenChek(tkn) {
  if (tkn== process.env.TOKEN) {
    return true
  }else{
    return false
  }
}