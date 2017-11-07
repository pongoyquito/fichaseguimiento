
//*********************************************************
//---- [ Bloque FUNCIONES: dentro del objeto "app" ] -----
//*********************************************************
//
//--- Objeto array
//--- "notas": [{"qfecha": "12/01/2017", "qpeso": "58,73", "qtbaja": "7.8", "qtalta": "12.8"}]

var app = {

	//------- Objeto array LISTA de registros -------
	
	model: {
		"notas": []
	},

	//------- Acceso a firebase de Google -------
	
	firebaseConfig: {
		apiKey: "AIzaSyC1Q571CyJF45XczMRhFqbyC4dSr8h95xc",
		authDomain: "libreta-nota.firebaseapp.com",
		databaseURL: "https://libreta-nota.firebaseio.com",
		projectId: "libreta-nota",
		storageBucket: "libreta-nota.appspot.com",
		messagingSenderId: "476197797154"
	},
  
	//------- Bloque: INICIO de objeto App -------
	
	inicio: function(){
		this.iniciaFastClick();
		this.iniciaBotones();
		this.refrescarLista();

		if (localStorage.length < 1) {
			//-- Limpiar.
			localStorage.clear();
			//-- Iniciar.
			app.IniciarLocalStorage();
		}
		app.MostrarLocalStorage();
	},

	iniciaFastClick: function() {
		FastClick.attach(document.body);
	},

	iniciaFirebase: function() {
		firebase.initializeApp(this.firebaseConfig);
	},

	iniciaBotones: function() {
		var salvar = document.querySelector('#salvar');
		var cancelar = document.querySelector('#cancelar');
		var eliminar = document.querySelector('#eliminar');
		var anadir = document.querySelector('#anadir');
		var limpiar = document.querySelector('#limpiar');

		var cancelarCb = document.querySelector('#cancelarCb');
		var salvarCb = document.querySelector('#salvarCb');
	
		anadir.addEventListener('click' ,this.mostrarEditor, false);
		salvar.addEventListener('click' ,this.salvarRegistro, false);
		cancelar.addEventListener('click' ,this.cancelarRegistro, false);
		eliminar.addEventListener('click' ,this.eliminarRegistro, false);
		limpiar.addEventListener('click' ,this.limpiarFichero, false);

		cancelarCb.addEventListener('click' ,this.ocultarEditorCab, false);
		salvarCb.addEventListener('click' ,this.salvarRegistroCab, false);

	},

	limpiarFichero: function() {
		var responde = confirm("¿ BORRAR TODOS los registros ?");
		if (responde == true) {
			//--- Ok. 
			app.borrarFichero();
			app.model.notas = [];
			app.inicio();
		} else {
			//-- Cancelar.
		}	
	},

	cancelarRegistro: function() {
		app.mostrarEditor();
		app.ocultarEditor();
	},

	eliminarRegistro: function() {
		var responde = confirm("¿ Desea BORRAR el registro ?");
		if (responde == true) {
			//--- Ok. 
			document.getElementById('qfecha').value = '';
			app.salvarRegistro();
		} else {
			//-- Cancelar.
		}	
	},
	
	mostrarEditor: function() {
		//alert('pulsado boton');
		document.getElementById('qfecha').value = fechaHoy();
		document.getElementById('qpeso').value = "";
		document.getElementById('qtbaja').value = "";
		document.getElementById('qtalta').value = "";
		document.getElementById("editor-registro").style.display = "block";
		document.getElementById('qfecha').focus();
		
		document.getElementById("lista-botonera").style.display = "none";
	},

	salvarRegistro: function() {
		if ( localStorage.getItem("Altura") > 0 ) {
			document.getElementById('qtbaja').value = CalcularIMC(document.getElementById('qpeso').value , localStorage.getItem("Altura"));
		}

		if (QueAccion == "M"){
			//alert('MODIFICAR');
			eval("app.model." + QueFila + ".qfecha = '" + document.getElementById('qfecha').value + "'");
			eval("app.model." + QueFila + ".qpeso = '" + document.getElementById('qpeso').value + "'");
			eval("app.model." + QueFila + ".qtbaja = '" + document.getElementById('qtbaja').value + "'");
			eval("app.model." + QueFila + ".qtalta = '" + document.getElementById('qtalta').value + "'");
			
			if ( document.getElementById('qfecha').value === '') {
				//-- Eliminar/Borrar elemento ..
				app.model.notas.splice(QueIndice, 1);
			};
			
		} else {
			app.construirNota();
		}
		QueAccion = "=";
		QueFila = "";
		QueIndice = "";
		app.ocultarEditor();
		app.refrescarLista();
		app.grabarDatos();
	},

	refrescarLista: function() {
		app.ordenarLista();
		//-- refrescar ...
		var div=document.getElementById('lista-registros');
		div.innerHTML = this.anadirNotasALista();
	},

	ordenarLista: function() {
		var notas = app.model.notas;

		//-- orden ascendente numerico:
		//-- cambiar signo en return para descendente).
		//--
		//-- notas.sort(function(a, b){return a.qpeso - b.qpeso}) ;
		
		//-- orden descendente alfanumerico:
		//--
		notas.sort( function(a, b){
			var x = a.qfecha.toLowerCase();
			var y = b.qfecha.toLowerCase();
			//-- cambiar signo para ascendente.
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
			}
		);
	},

	anadirNotasALista: function() {
		var notas = this.model.notas;
		var notasDivs = '';
		
		notasDivs = "<table class='tabla' id='tabla'>";
		notasDivs = notasDivs + "<tr><th>Fecha</th><th>Peso<br><small>(kg)</small></th><th>IMC.</th><th>Cintura<br><small>(cm)</small></th></tr>";
		
		for (var i in notas) {
			var qfecha = "<td>" + mostrarFecha( notas[i].qfecha ) + "</td><td>" + notas[i].qpeso + "</td><td>" + notas[i].qtbaja + "</td><td>" + notas[i].qtalta + "</td>";
			notasDivs = notasDivs + this.anadirNota(i, qfecha);
		}
		
		notasDivs = notasDivs + "</table>";
		return notasDivs;
	},

	anadirNota: function(id, qfecha) {
		/// "<div class='registro-item' id='notas[" + id + "]' onclick=app.clicFila(this) >" + qfecha + "</div>";
	return "<tr class='registro-item' id='notas[" + id + "]' onclick=app.clicFila(this) >" + qfecha + "</tr>";
	},

	//-----------------------------------------------------
	
	construirNota: function() {
		var notas = app.model.notas;
		if ( document.getElementById('qfecha').value != '') {
			//-- push() - añade al final
			//-- unshift - añade al principio
			notas.unshift({"qfecha": app.extraerQFecha(), "qpeso": app.extraerQPeso(), "qtbaja": app.extraerQTbaja(), "qtalta": app.extraerQTalta() });
		};
	},

	extraerQFecha: function() {
		return document.getElementById('qfecha').value;
	},
	extraerQPeso: function() {
		return document.getElementById('qpeso').value;
	},
	extraerQTbaja: function() {
		return document.getElementById('qtbaja').value;
	},
	extraerQTalta: function() {
		return document.getElementById('qtalta').value;
	},

	ocultarEditor: function() {
		document.getElementById("editor-registro").style.display = "none";
		document.getElementById("lista-botonera").style.display = "";
	},

	clicFila: function(fila) {
		//alert('click en la fila: ' + fila.id );
		app.mostrarEditor();
		document.getElementById('qfecha').value = eval("app.model." + fila.id + ".qfecha");
		document.getElementById('qpeso').value = eval("app.model." + fila.id + ".qpeso");
		document.getElementById('qtbaja').value = eval("app.model." + fila.id + ".qtbaja");
		document.getElementById('qtalta').value = eval("app.model." + fila.id + ".qtalta");
		QueAccion = "M";
		QueFila = fila.id;
		QueIndice = QueFila.replace("notas[", "");
		QueIndice = QueIndice.replace("]", "");
	},

	//-----------------------------------------------------
	//--- cordova.file. externalApplicationStorageDirectory 
	//--- cordova.file. dataDirectory
	//-----------------------------------------------------
	
	//------- Bloque: ESCRIBIR DATOS en fichero -------
	
	grabarDatos: function() {
		window.resolveLocalFileSystemURL( cordova.file.externalApplicationStorageDirectory , this.gotFS, this.fail);
	},
	
	gotFS: function(fileSystem) {
		//-- dirEntry.getFile
        fileSystem.getFile("mifichaseguimiento.txt", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
    },
	
    gotFileEntry: function(fileEntry) {
        fileEntry.createWriter(app.gotFileWriter, app.fail);
    },
	
	gotFileWriter: function(writer) {
		
		writer.onwriteend = function(evt) {
			console.log(" *** datos grabados ***");
			if (app.hayWifi()) {
				//--- Guardo una copia en nube.
				app.salvarFirebase();
			};
		};

		var notas = app.model.notas;
		var todito = "";
		for (var i in notas) {
			var qfecha = notas[i].qfecha + "|" + notas[i].qpeso;
			todito = todito + qfecha + "@";
		}
		console.log(todito);
		
		writer.write(JSON.stringify(app.model));
		//writer.write(todito);
	},

	hayWifi: function() {
		return navigator.connection.type === "wifi";
	},

	salvarFirebase: function() {
		var ref = firebase.storage().ref('mifichaseguimiento.txt');
		ref.putString(JSON.stringify(app.model));
	},
	
	//------- Bloque: LEER DATOS  en fichero -------
	
	leerDatos: function() {
		window.resolveLocalFileSystemURL( cordova.file.externalApplicationStorageDirectory , this.obtenerFS, this.fail);
	},

	obtenerFS: function(dirEntry) {
		console.log('**(D)*** ' + dirEntry.name);
        dirEntry.getFile("mifichaseguimiento.txt", {create:false}, app.obtenerFileEntry, app.inicio());
    },
	
    obtenerFileEntry: function(fileEntry) {
		console.log('**(F)*** ' + fileEntry.name);
        fileEntry.file(app.leerFile, app.fail);
    },

    leerFile: function(file) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			var data = evt.target.result;
			/*
				var lectura = data.split("@");

				var notas = app.model.notas;
				for (var i in lectura) {
					var qfecha = lectura[i];
					if (qfecha.length > 0) {
						fistro = qfecha.split("|");
						notas.push({"qfecha": fistro[0] , "qpeso": fistro[1] });
					};
				};
			*/
            
			app.model = JSON.parse(data);
			app.inicio();
        };
        reader.readAsText(file);
    },

	//------- Bloque: BORRAR FICHERO -------
			
	borrarFichero: function() {
		window.resolveLocalFileSystemURL( cordova.file.externalApplicationStorageDirectory , this.borrarFS, this.fail);
	},

	borrarFS: function(dirEntry) {
        dirEntry.getFile("mifichaseguimiento.txt", {create:false}, app.borrarFileEntry, app.fail);
    },
	
    borrarFileEntry: function(fileEntry) {
		console.log('**(F)*** ' + fileEntry.name);
        fileEntry.remove( function(){console.log('Fichero borrado.')}, app.fail);
    },
	
	//------- Bloque: ERROR DATOS en fichero -------
			
	fail: function(error) {
		console.log(error.code);
	},

	
	//------- Bloque: CABECERA de lista -------

	mostrarCabecera: function() {
		//alert('pulsado boton');
		document.getElementById('cbaltura').value = localStorage.getItem("Altura");
		document.getElementById("editor-registro-cab").style.display = "block";
		document.getElementById('cbaltura').focus();
		
		document.getElementById("lista-botonera").style.display = "none";
	},

	ocultarEditorCab: function() {
		document.getElementById("editor-registro-cab").style.display = "none";
		document.getElementById("lista-botonera").style.display = "";
	},

	
	salvarRegistroCab: function() {
		localStorage.setItem("Altura", document.getElementById('cbaltura').value );
		app.MostrarLocalStorage();
		app.ocultarEditorCab();
		app.refrescarListaIMC();
		app.refrescarLista();
		app.grabarDatos();
	},

	refrescarListaIMC: function() {
		var notas = this.model.notas;

		if ( localStorage.getItem("Altura") > 0 ) {
			for (var i in notas) {
				notas[i].qtbaja = CalcularIMC( notas[i].qpeso, localStorage.getItem("Altura"));
			}
		}
	},

	IniciarLocalStorage: function() { 
		localStorage.setItem("Altura", "" );
		/*
		localStorage.setItem("Nacido", "2017-12-27"); 
		localStorage.setItem("Edad", "56"); 
		localStorage.setItem("Sexo", "H"); 
		*/
	},
	
	MostrarLocalStorage: function() { 
		var span=document.getElementById('ver-altura');
		span.innerHTML = localStorage.getItem("Altura");
	},

	//------- FINAL -------
};

//*********************************************************
//---------- [ Bloque Principal: Arranque ] ---------------
//*********************************************************

	var QueAccion = '=';
	var QueFila = '';
	var QueIndice = '';
	var localStorage = window.localStorage;

	if('addEventListener' in document){
		  document.addEventListener('deviceready', function() {
				//app.inicio();
				app.iniciaFirebase();
				app.leerDatos();
		}, false);
	};

//=========================================================
//-------------- [ Funciones Generales ] ------------------
//=========================================================

	function fechaHoy() {
		//--- Obtener cadena con la fecha de hoy.
		//----------------------------------------
		var date = new Date();
		
		//--- Luego le sacamos los datos any, dia, mes 
		//--- y numero de dia de la variable date
		var any = date.getFullYear();
		var mes = date.getMonth();
		var ndia = date.getDate();
		
		//--- Damos a los dias y meses el valor en número
		mes+=1;
		if(mes<10) mes="0"+mes;
		if(ndia<10) ndia="0"+ndia;
		
		//--- Juntamos todos los datos en una variable
		var fecha = ndia + "/" + mes + "/" + any;
		var fecha =  any + "-" + mes + "-" + ndia;
		
		//--- resultado.
		return fecha;
	};

	function mostrarFecha(Qfecha) {
		//--- Mostrar fecha dd/mm/aaaa.
		//----------------------------------------
			
		//--- Sacamos los datos any, dia, mes 
		//--- y numero de dia de la variable date
		var lista = Qfecha.split("-");
		var any = lista[0];
		var mes = lista[1];
		var ndia = lista[2];
		
		//--- Damos a los dias y meses el valor en número
		//mes+=1;
		//if(mes<10) mes="0"+mes;
		//if(ndia<10) ndia="0"+ndia;
		
		//--- Juntamos todos los datos en una variable
		var fecha = ndia + "/" + mes + "/" + any;
		
		//--- resultado.
		return fecha;
	};

	 function CalcularIMC(Peso,Talla)
	//--------------------------------------------------------------------------
	// 	IMC = Peso (kg.) / [ (Altura en m.) * (Altura en m.) ]  
	////////////////////////////////////////////////////////////////////////////
	{
		var Resultado,PIdeal;
		Resultado = 0;

		if ( (Peso == 'undefined') || (Peso == null) ) { Peso = 0;}
		if ( (Talla == 'undefined') || (Talla == null) ) { Talla = 0;}

		if ( isNaN(Peso) || isNaN(Talla) )
		{
			Resultado = 0;
		} else {
			if (  Talla > 0 )
			{
				Resultado = ( Peso / ((Talla * Talla) * 0.0001) )  ;
			}
		}

		Resultado = Resultado.toFixed(2);
		return Resultado;
	};

