
const express = require('express');
const fs = require('fs');

class Contenedor {
    constructor(nombreArchivo) {
        this.arch = nombreArchivo;
        this.ruta = './' + this.arch;
    }

    async getAll() {
        try {
            const contenido = await fs.promises.readFile(this.ruta, 'utf-8');
            return JSON.parse(contenido);
        }
        catch (error) {
            console.log(`El archivo no existe, se va a pasar a la creación del mismo | Nombre del Archivo: ${this.arch}`);
            await fs.promises.writeFile(this.ruta, JSON.stringify([], null, 2));
            const contenido = await fs.promises.readFile(this.ruta, 'utf-8');
            return JSON.parse(contenido);
        }
    }

    async save(elemento) {
        try {
            if (!(await this.objetoRepetido(elemento))) {
                elemento.id = await this.nuevoID();
                const arr = await this.getAll();
                arr.push(elemento);
                await fs.promises.writeFile(this.ruta, JSON.stringify(arr, null, 2));
                return elemento.id;
            } else {
                console.log("Este objeto ya existe en el archivo.");
                return null;
            }
        }
        catch (error) {
            console.log("No se pudo agregar el objeto al archivo.");
            return null;
        }
    }

    async nuevoID() {
        let maximo = 0;
        const arr = await this.getAll();
        arr.forEach(el => {
            if (parseInt(el.id) > maximo) {
                maximo = parseInt(el.id);
            }
        })
        maximo++;
        return maximo;
    }

    async objetoRepetido(elemento) {
        const arr = await this.getAll();
        let repetido = false;
        arr.forEach(el => {
            if (el.title == elemento.title && el.price == elemento.price && el.thumbnail == elemento.thumbnail) {
                repetido = true;
            }
        })
        return repetido;
    }

    async getById(id) {
        try {
            const arr = await this.getAll();
            const elemento = arr.find(el => (parseInt(el.id) === parseInt(id)));
            if (elemento == undefined) {
                console.log("No existe ese id " + id);
            }
            return elemento || null;
        }
        catch (error) {
            console.log("Hubo un inconveniente con la obtención del ID");
        }
    }

    async deleteById(id) {
        let encontrado = false;
        let i = 0;

        try {
            const arr = await this.getAll();
            while (!encontrado && i < arr.length) {
                if (parseInt(arr[i].id) === parseInt(id)) {               
                    const eliminado = arr.splice(i, 1);     
                    console.log(arr);
                    await fs.promises.writeFile(this.ruta, JSON.stringify(arr, null, 2));
                    console.log("Se eliminó el registro.");
                    console.log(eliminado);
                    encontrado = true;
                } else {
                    i++;
                }
            }
            if(!encontrado){
                console.log(`No existe el ID que se quizo eliminar(${id}).` );
            }
        }
        catch (error) {
            console.log("No existe el ID que se quizo eliminar.");            
        }
    }

    async deleteAll(){
        try{
            await fs.promises.writeFile(this.ruta, JSON.stringify([], null, 2));
            console.log("Todos los registros fueron eliminados.");
        }
        catch(error){
            console.log("No se pudo eliminar los registros.");
        }
    }

    async deleteFile(){
        try{
            await fs.promises.unlink(this.ruta);
            console.log("Archivo Eliminado");
        }
        catch(error){
            console.log("No se pudo eliinar el archivo.");
        }        
    }
}

class Producto {
    constructor(title, price, thumbnail) {
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
        this.id = 0;
    }

}

const app = express();

const PORT = 8080;


// SERVER

const server = app.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en el puerto ${server.address().port} usando Express`);
})

// APP

const a = new Contenedor('productos.txt');

app.get('/', (req, res) => {
    res.send(`
    <h1>Bienvenid@ a este experimento</h1>
    <ul>
        <li><a href="/productos">Productos</a></li>
        <li><a href="/productoRandom">Producto Random</a></li>
    </ul>
    `)
})
app.get('/productos', async (req,res) => {        

    let arr = await a.getAll();
    
    res.send(arr);
})


app.get('/productoRandom', async (req,res) => {        
    let tope = await a.nuevoID() - 1;    
    let random = Math.round(Math.random() * (tope - 1) + 1).toFixed(0);
    let el = await a.getById(random);

    res.send(el);
})

server.on("error", e => console.log(`Error en el servidor ${e}`));
