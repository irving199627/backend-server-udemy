var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospitales');

app.use(fileupload());

// rutas
app.put('/:tabla/:id', (req, res, next) => {
    var tabla = req.params.tabla;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tabla) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            err: { message: 'Tipo de coleccion no es valida' }
        });
    }
    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            err: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            err: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // mover el archivo del temporal al path
    var path = `./uploads/${ tabla }/${ nombreArchivo }`

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                err: err
            });
        }
        subirPorTipo(tabla, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'archivo movido',
        //     extensionArchivo: extensionArchivo
        // });
    })
});

function subirPorTipo(tabla, id, nombreArchivo, res) {
    if (tabla === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    console.log('borrado');
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            })

        });
    }

    if (tabla === 'medicos') {
        Medico.findById(id, (err, medico) => {

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    console.log('borrado');
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            })

        });
    }

    if (tabla === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    console.log('borrado');
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            })

        });
    }
}

module.exports = app;