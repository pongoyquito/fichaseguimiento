
//*********************************************************
//---- [ Bloque FUNCIONES: dentro del objeto "app" ] -----
//*********************************************************
//
//--- Objeto array
//--- "registres": [{"qfecha": "12/01/2017", "qpeso": "58,73", "qimc": "7.8", "qcinta": "12.8"}]

var app = {

	//------- Objeto array LISTA de registros -------
	//  
	
	model: {
		"registres": []
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
		this.revisarVersion();
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

	revisarVersion: function() {
		//
		//--- Para version 1.0.1 ---
		///////////////////////////////////////////////////
		var mimodel = this.model;
		
		if( mimodel.hasOwnProperty('registres') ) {
			// La propiedad existe, sea cual sea su valor
			delete mimodel.notas ;
		} else {
			// La propiedad NO existe, sea cual sea su valor
			mimodel.registres = mimodel.notas ;
			delete mimodel.notas ;
		}

		var registres = this.model.registres;		

		for (var i in registres) {
			if( registres[i].hasOwnProperty('qimc') ) {
				// La propiedad existe, sea cual sea su valor
				delete registres[i].qtbaja ;
			} else {
				// La propiedad NO existe, sea cual sea su valor
				registres[i].qimc = registres[i].qtbaja ;
				delete registres[i].qtbaja ;
			}
			if( registres[i].hasOwnProperty('qcinta') ) {
				// La propiedad existe, sea cual sea su valor
				delete registres[i].qtalta ;
			} else {
				// La propiedad NO existe, sea cual sea su valor
				registres[i].qcinta = registres[i].qtalta ;
				delete registres[i].qtalta ;
			}
		}
		//---(fin)--
	},
	
	limpiarFichero: function() {
		var responde = confirm("¿ BORRAR TODOS los registros ?");
		if (responde == true) {
			//--- Ok. 
			app.borrarFichero();
			app.model.registres = [];
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
		document.getElementById('qimc').value = "";
		document.getElementById('qcinta').value = "";
		document.getElementById("editor-registro").style.display = "block";
		document.getElementById('qfecha').focus();
		
		document.getElementById("lista-botonera").style.display = "none";
	},

	salvarRegistro: function() {
		if ( localStorage.getItem("Altura") > 0 ) {
			document.getElementById('qimc').value = CalcularIMC(document.getElementById('qpeso').value , localStorage.getItem("Altura"));
		}

		if (QueAccion == "M"){
			//alert('MODIFICAR');
			eval("app.model." + QueFila + ".qfecha = '" + document.getElementById('qfecha').value + "'");
			eval("app.model." + QueFila + ".qpeso = '" + document.getElementById('qpeso').value + "'");
			eval("app.model." + QueFila + ".qimc = '" + document.getElementById('qimc').value + "'");
			eval("app.model." + QueFila + ".qcinta = '" + document.getElementById('qcinta').value + "'");
			
			if ( document.getElementById('qfecha').value === '') {
				//-- Eliminar/Borrar elemento ..
				app.model.registres.splice(QueIndice, 1);
			};
			
		} else {
			app.construirRegistre();
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
		div.innerHTML = this.anadirRegistresALista();
	},

	ordenarLista: function() {
		var registres = app.model.registres;

		//-- orden ascendente numerico:
		//-- cambiar signo en return para descendente).
		//--
		//-- registres.sort(function(a, b){return a.qpeso - b.qpeso}) ;
		
		//-- orden descendente alfanumerico:
		//--
		registres.sort( function(a, b){
			var x = a.qfecha.toLowerCase();
			var y = b.qfecha.toLowerCase();
			//-- cambiar signo para ascendente.
			if (x < y) {return 1;}
			if (x > y) {return -1;}
			return 0;
			}
		);
	},

	anadirRegistresALista: function() {
		var registres = this.model.registres;
		var registresDivs = '';
		
		textoIMC = "";
		if ( registres.length > 0 ){
			textoIMC = "<div class='lista-imc-cab'><span class=''> IMC <i>último</i>: <b>" + CalcularIMCtexto(registres[0].qimc) + "</b></span>" + CalcularIMCimg(registres[0].qimc) + "</div>" ;
		}
		
		registresDivs = textoIMC + "<table class='tabla' id='tabla'>";
		registresDivs = registresDivs + "<tr><th>Fecha</th><th>Peso<br><small>(kg)</small></th><th>IMC.</th><th>Cintura<br><small>(cm)</small></th></tr>";
		
		for (var i in registres) {
			
			signo = "";
			if (i==0) {
				if (registres.length > 1){
					signo = 0;
					signo = registres[0].qpeso - registres[1].qpeso;
					if (signo < 0) {
						signo = "▼";
					} else {
						if (signo > 0) {
							signo = "▲";
						} else {
							signo = "«";
						}
					}
				}
			}
			
			var qfecha = "<td>" + mostrarFecha( registres[i].qfecha ) + "</td><td>"  + signo + registres[i].qpeso + "</td><td>" + registres[i].qimc + "</td><td>" + registres[i].qcinta + "</td>";
			registresDivs = registresDivs + this.anadirRegistre(i, qfecha);
		}
		
		registresDivs = registresDivs + "</table>";
		return registresDivs;
	},

	anadirRegistre: function(id, qfecha) {
		/// "<div class='registro-item' id='registres[" + id + "]' onclick=app.clicFila(this) >" + qfecha + "</div>";
	return "<tr class='registro-item' id='registres[" + id + "]' onclick=app.clicFila(this) >" + qfecha + "</tr>";
	},

	//-----------------------------------------------------
	
	construirRegistre: function() {
		var registres = app.model.registres;
		if ( document.getElementById('qfecha').value != '') {
			//-- push() - añade al final
			//-- unshift - añade al principio
			registres.unshift({"qfecha": app.extraerQFecha(), "qpeso": app.extraerQPeso(), "qimc": app.extraerQIMC(), "qcinta": app.extraerQCintura() });
		};
	},

	extraerQFecha: function() {
		return document.getElementById('qfecha').value;
	},
	extraerQPeso: function() {
		return document.getElementById('qpeso').value;
	},
	extraerQIMC: function() {
		return document.getElementById('qimc').value;
	},
	extraerQCintura: function() {
		return document.getElementById('qcinta').value;
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
		document.getElementById('qimc').value = eval("app.model." + fila.id + ".qimc");
		document.getElementById('qcinta').value = eval("app.model." + fila.id + ".qcinta");
		QueAccion = "M";
		QueFila = fila.id;
		QueIndice = QueFila.replace("registres[", "");
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

		var registres = app.model.registres;
		var todito = "";
		for (var i in registres) {
			var qfecha = registres[i].qfecha + "|" + registres[i].qpeso;
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

				var registres = app.model.registres;
				for (var i in lectura) {
					var qfecha = lectura[i];
					if (qfecha.length > 0) {
						fistro = qfecha.split("|");
						registres.push({"qfecha": fistro[0] , "qpeso": fistro[1] });
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
		var registres = this.model.registres;

		if ( localStorage.getItem("Altura") > 0 ) {
			for (var i in registres) {
				registres[i].qimc = CalcularIMC( registres[i].qpeso, localStorage.getItem("Altura"));
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

	 function CalcularIMCtexto(IMC)
	//--------------------------------------------------------------------------
	// 	Literal del IMC - Indice de Masa Corporal  
	////////////////////////////////////////////////////////////////////////////
	{
		var Resultado, QueNumero;
		Resultado = "** NO DEFINIDO **";

		if ( (IMC == 'undefined') || (IMC == null) ) { IMC = "***";}

		if ( isNaN(IMC) )
		{
			Resultado = "* FALTA el PESO o la ALTURA *";
		} else {

			QueNumero = parseFloat(IMC);

			if ( QueNumero == 0) {
				Resultado = "* FALTA el PESO o la ALTURA *";	
			} else {
				if ( QueNumero < 16.00) {
					Resultado = "Infrapeso. Delgadez severa";	
				} else {
					if ( QueNumero < 17.00) {
						Resultado = "Infrapeso. Delgadez moderada";	
					} else {
						if ( QueNumero < 18.50) {
							Resultado = "Infrapeso. Delgadez aceptable";	
						} else {
							if ( QueNumero < 25.00) {
								Resultado = "Peso Normal";	
							} else {
								if ( QueNumero < 30.00) {
									Resultado = "Sobrepeso";	
								} else {
									if ( QueNumero < 35.00) {
										Resultado = "Obeso - Tipo I";	
									} else {
										if ( QueNumero < 40.00) {
											Resultado = "Obeso - Tipo II";	
										} else {
											if ( QueNumero < 999.00) {
												Resultado = "Obeso - Tipo III";	
											} else {
												Resultado = "** ERROR en PESO o ALTURA **";
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return Resultado;
	}
	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	
	 function CalcularIMCimg(IMC)
	//--------------------------------------------------------------------------
	// 	Imagen del IMC - Indice de Masa Corporal  
	////////////////////////////////////////////////////////////////////////////
	{
		var Resultado, QueNumero;
		Resultado = "** NO DEFINIDO **";

		if ( (IMC == 'undefined') || (IMC == null) ) { IMC = "***";}

		if ( isNaN(IMC) )
		{
			Resultado = "* FALTA el PESO o la ALTURA *";
		} else {

			QueNumero = parseFloat(IMC);

			if ( QueNumero == 0) {
				Resultado = "";	
			} else {
				if ( QueNumero < 16.00) {
					Resultado = "cara_azul.jpg";	
				} else {
					if ( QueNumero < 17.00) {
						Resultado = "cara_azul.jpg";	
					} else {
						if ( QueNumero < 18.50) {
							Resultado = "cara_oh.jpg";	
						} else {
							if ( QueNumero < 25.00) {
								Resultado = "cara_ok.jpg";	
							} else {
								if ( QueNumero < 30.00) {
									Resultado = "cara_sorpresa.jpg";	
								} else {
									if ( QueNumero < 35.00) {
										Resultado = "cara_triste.jpg";	
									} else {
										if ( QueNumero < 40.00) {
											Resultado = "cara_triste.jpg";	
										} else {
											if ( QueNumero < 999.00) {
												Resultado = "cara_triste.jpg";	
											} else {
												Resultado = "";
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		if (Resultado > "") {
			Resultado = "<img src='assets/"+ Resultado + "' height='40' style='margin-left: 10px' ></img>"
		}
		return Resultado;
	}
	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
