var express = require('express')
var bodyParser=require('body-parser')
var multer=require('multer')
var neo4j= require('neo4j-driver').v1
var http = require('http')

var app = express()
var upload=multer();

// var driver = neo4j.v1.driver(
//     'bolt://localhost:7687',
//     neo4j.v1.auth.basic('neo4j', '12341234')
//   )

const driver = neo4j.driver('bolt://104.196.70.182:7687', neo4j.auth.basic('ApiGeter', '12341234'))
const session = driver.session()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
    
app.get('/', (req, res) => {
  res.status(200).send("Welcome to API REST")
})

http.createServer(app).listen(8005, () => {
  console.log('Server start on http://localhost:8005');
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
  const query=req.body.statements.query
  session.run(query).then(
    result=>{
      driver.close()
      return result.records.map(record=>{
        resultado.push(record.get(0))
      })
    }
  ).then(()=>{
    res.send(resultado)
    session.close()
  })
  

})