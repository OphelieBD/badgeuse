$(document).ready(function(){ //dès que la page est chargée, appelle la fonction qui fait la requête ajax pour récupérer les événements déjà en BDD
	recuperationBDD();
});

// Fonction qui fait la requête pour récupérer les élèments en BDD
function recuperationBDD(){    
    $.ajax({
        url: 'controleur.php',
        dataType: 'text',
        data: { 
            action: "planning" 
        },
        success: afficherPlanning
    }); 
} 

//Fonction pour afficher les jours précédents et suivants (mettre '2' pour avancer de 2 jours et '-2' pour reculer de 2 jours)
Date.prototype.addDays = function(days) {
    var date = new Date(this);
   date.setDate(this.getDate() + parseInt(days));
   return date;
};

// Fonction qui permet directement d'avoir le bon numéro de jour car initialement, le dimanche était le jour 0. Maintenant c'est lundi
function recupBonJour(date){
    var jour = date.getUTCDay();
    if(jour == 0){
        return 6;
    }
    else{
        return jour-1;
    }
}

// Fonction qui permet de renvoyer un string de la date
function getAffichageCorrect(date){
    var dd = date.getDate();
    var mm = date.getMonth()+1; //Janvier = 0 à la base
    var yyyy = date.getFullYear();
    if(dd<10) 
    {
        dd = '0'+dd
    } 
    if(mm<10)
    {
        mm = '0'+mm
    } 
    return dd + '/' + mm + '/' + yyyy;
}

// Fonction globale pour déterminer le jour J, les jours avant et après de la semaine en cours
function calculSemaine(jour){
    // Création de la variable array des jours de la semaine
    var semaineTableau = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

    // On récupère le jour de la semaine
    var jourSemaine = recupBonJour(jour); 

    semaineTableau[jourSemaine] = jour; // Je remplace le jour actuel dans le tableau puisque maintenant je le connais

    var i = 1;
    while (jourSemaine < 6) // Boucle qui va déterminer les jours précédents et suivants
    {    
        jourSemaine++;
        semaineTableau[jourSemaine] = jour.addDays(i);
        i++;
    }
    var i = -1;
    var jourSemaine = recupBonJour(jour); 
    while (jourSemaine > 0) // Boucle qui va déterminer les jours précédents et suivants
    {   
        jourSemaine--;
        semaineTableau[jourSemaine] = jour.addDays(i);
        i--;
    }
    return semaineTableau;
}

// Fonction qui permet d'afficher le tableau 
function afficheSemaine(array){
    for (var i = 0; i < array.length; i++) 
    {
        $('#grilleContenu').append('<div class="col-lg-1 col-sm-12 ensemble1Jour"><div class="titre"onClick="clicGrille(this);"">'+getAffichageCorrect(array[i])+'</div>' + 
                                   '<div class="description"></div></div>');        

        $('.ensemble1Jour').css("border", "1px solid #5A5A5A");
        $('.ensemble1Jour').css("borderRight", "none"); 
        $(".ensemble1Jour").last().css('borderRight', '1px solid #5A5A5A');  
    
        if (array[i] < today) //Je grisonne les jours passés
        {
            $('.ensemble1Jour').addClass("jourPasse");
            $('.titre').addClass("titreJourPasse");
        } 

        if (array[i].getTime() == today.getTime())// Je met en valeur le jour actuel
        {
            $('.ensemble1Jour').eq(recupBonJour(today)).addClass('jourJ');
            $('.titre').eq(recupBonJour(today)).css({'paddingTop': '8px', 'paddingBottom': '8px'}); 
        } 
    }
}

// Fonction appelée quand on clique sur une case, pour que le formulaire apparaisse
function clicGrille(mot)
{
    $("form").fadeIn('slow');
    $('#btnHoraires').css('display', 'none'); 
    var dateSelectionnee = $(mot).text(); //on récupère la date du jour cliqué
    $("#champCache").val(dateSelectionnee); //et on le met dans l'input hidden pour le transmettre lors de l'appel ajax à la BDD

    $('.titre').on('click', function() //quand on clique ailleurs sur la page, le formulaire disparait
	{
		$('form').css("display", "none");
    	$('#btnHoraires').fadeIn(1000, 'linear');
	});
}

function afficherPlanning(data) //affiche les horaires présents en base de données
{
    var donneesRecues = JSON.parse(data);
    $(".description").empty(); //on vide toutes les cases
	var totalTableau = [0, 0, 0, 0, 0, 0, 0]; // création du tableau en prévision du calcul du nb d'heures effectuées
    var sommeTableau = 0;

    for (var i = 0; i < donneesRecues.length; i++) // parcours les résultats reçus de la requête
    {
        var id = donneesRecues[i]['id']; 
        var date = donneesRecues[i]['date']; 
        var heureDebut = donneesRecues[i]['heureDebut'];
        var heureFin = donneesRecues[i]['heureFin'];
        if (heureFin == null) 
        {
        	heureFin = 0;
        	$('h1').css('border', '2px black solid');
        	$('#btnStart').attr('disabled', 'disabled');
        	$('#btnFinish').removeAttr('disabled');
        }
        else
        {
			$('h1').css('border', 'none');
        }

        var h1 = parseInt(heureDebut.substr(0,2)); // je récupère l'heure de début (uniquement l'heure, les minutes sont dans m1)
        var m1 = parseInt(heureDebut.substr(3,2));// je récupère les minutes de début (uniquement les minutes, les heures sont dans h1)

        if (heureFin == 0) //Si l'heure de fin n'est pas encore notée (pas encore appuyé sur le btn "terminer")
        {
        	var h2 = 0; 
        	var m2 = 0;
	        var bonneHeureFin = "?";
        }
        else
        {
        	var h2 = parseInt(heureFin.substr(0,2)); 
        	var m2 = parseInt(heureFin.substr(3,2));
	        var bonneHeureFin = heureFin.substr(0,5);
        }
        
        var mtotal1 = h1*60+m1; //je convertis les heures en minutes puis je les additionne aux minutes que j'avais au début
        var mtotal2 = h2*60+m2;
        var ecart = mtotal2-mtotal1; // je soustrais l'horaire de fin à l'horaire de début pour connaitre combien de temps il s'est écoulé (en minutes)
        var mm = ecart%60; // je convertis mes minutes en heures
        var h = (ecart-mm)/60;
        var bonneHeureDebut = heureDebut.substr(0,5);

        if (bonneHeureFin == "?") 
        {
        	h = "00";
        	mm = "00";
        }

        if (mm==0) //mise en forme 
        {
        	mm = "00";
        }			


        for (var j = 0; j < semaineTableau.length; j++) //je compare ma BDD avec les jours du tableau puis j'y affiche les horaires reçus de la BDD
        {
            if (date == getAffichageCorrect(semaineTableau[j]))
            {
                $('.description').eq(recupBonJour(semaineTableau[j])).append('<div class="horairesAjoutes" onClick="editForm(heureDebut, heureFin);">'+ bonneHeureDebut + ' - ' + bonneHeureFin +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="modif fas fa-pencil-alt"></i></div>'+
                															' = ' + '<span class="totalJour"><strong>' + h + 'h' + mm + '</strong></span> <br/><br/>');
		    	
               	totalTableau[j] += ecart; // j'ajoute dans la case j du tableau l'écart correspondant
			}      


        } 
    }

    for (var k = 0; k < totalTableau.length; k++) // addition des écarts entre eux
    {
    	sommeTableau += totalTableau[k];
    }

    var heuresRestantes = 40*60 - sommeTableau; //je convertis les 40h en minutes puis j'y soustrais la sommes des heures effectuées cette semaine
    var mRestantes = heuresRestantes%60; //je convertis les minutes effectuées cette semaine en heures
    var hRestantes = (heuresRestantes-mRestantes)/60;

    $('#heuresAFaire').empty();
    if (sommeTableau >= (40*60)) 
    {
	    $('#heuresAFaire').append('rien');
    }
    else
    {
	    $('#heuresAFaire').append(hRestantes + ' heures et ' +mRestantes + ' minutes');
    }
}

//fonction appelée quand on clique sur un horaire du tableau
function editForm(data1, data2){
	console.log($('data1').val());
}

// Date du jour
var today = new Date();
var aujourdhui = new Date();
var heureActuelle = today.getUTCHours()+1;
var minutesActuelles = today.getUTCMinutes();
var secondesActuelles = today.getUTCSeconds();
var semaineTableau = calculSemaine(aujourdhui);
afficheSemaine(semaineTableau);

if (secondesActuelles < 10) 
{
	secondesActuelles = "0"+secondesActuelles;
}

if (minutesActuelles < 10) 
{
	minutesActuelles = "0"+minutesActuelles;
}

if (heureActuelle < 10) 
{
	heureActuelle = "0"+heureActuelle;
}

var heureCompleteActuelle = heureActuelle + ":" + minutesActuelles + ":" + secondesActuelles;

$("#heureDebut, #heureFin").on("change paste keyup", function() { //rend le bouton de validation cliquable dès qu'on écrit dans les input associés
   $("#boutonValidation").removeAttr('disabled');
});

// Quand on clique sur flèche droite pour afficher la semaine suivante
$( "#flecheDroite" ).click(function() {
    $("#grilleContenu").empty(); // On vide le div de la grille
    aujourdhui = aujourdhui.addDays(7); //on rajoute 7 jours à la semaine actuelle 
    semaineTableau = calculSemaine(aujourdhui);
    afficheSemaine(semaineTableau);	
    recuperationBDD();
});

// Quand on clique sur flèche gauche pour afficher la semaine précédente
$( "#flecheGauche" ).click(function() {
    $("#grilleContenu").empty(); // On vide le div de la grille
    aujourdhui = aujourdhui.addDays(-7); //on rajoute 7 jours à la semaine actuelle 
    semaineTableau = calculSemaine(aujourdhui);
    afficheSemaine(semaineTableau);
	recuperationBDD();
});

$("#form").submit(function(e){ //Dès qu'on valide le formulaire, on fait requête ajax pour l'enregistrer en BDD
    var dato = $(this).serialize();
    $("#heureDebut, #heureFin").val(''); // vide les input
    $("#boutonValidation").attr('disabled', 'disabled'); //remet le bouton disable
    e.preventDefault(); // Annulation de l'envoi des données via le formulaire (car on le fait via ajax)
    $.ajax({
        type : "POST",
        url: 'controleur.php',
        dataType: 'json',
        data: dato,
        success : function() {
			recuperationBDD();
    		$("form").delay(1000).fadeOut(1000, "linear");  
            $("#confirmationEnvoi").html("Bien enregistré"); // message de validation
            $("#confirmationEnvoi").delay(1000).fadeOut(1000, 'linear'); 
    		$('#btnHoraires').delay(1000).fadeIn(1000, "linear"); 
        },
        error: function() {
   			$("form").delay(1000).fadeOut(1000, "linear"); 
            $("#confirmationEnvoi").html("Erreur d'appel Ajax");
            $("#confirmationEnvoi").delay(1000).fadeOut(100, 'linear'); 
        }
    });
});

// Quand on clique sur le bouton "commencer"
$('#btnStart').click(function(){
	var heureActuelleDebut = heureCompleteActuelle;
	$.ajax({
		type: 'POST',
		url: 'controleur.php',
		data: {
			action: "ajouterAuto",
			dateJour: getAffichageCorrect(today),
			heureDebut: heureActuelleDebut
		},
		success: function()
		{
			recuperationBDD();				
			$('#btnStart').attr('disabled', 'disabled');
			$('#btnFinish').removeAttr('disabled');		
		}, 
		error: function()
		{
			console.log('erreur ajax');
		}
	});
});

// Quand on clique sur le bouton "finir"
$('#btnFinish').click(function(){
	var newDay = new Date();
	var hActuelle = newDay.getUTCHours()+1;
	var mActuelles = newDay.getUTCMinutes();
	var sActuelles = newDay.getUTCSeconds();

	if (sActuelles < 10) 
	{
		sActuelles = "0"+sActuelles;
	}

	if (mActuelles < 10) 
	{
		mActuelles = "0"+mActuelles;
	}

	if (hActuelle < 10) 
	{
		hActuelle = "0"+hActuelle;
	}

	var heureActuelleFin = hActuelle + ":" + mActuelles + ":" + sActuelles;

	$.ajax({
		type: 'POST',
		url: 'controleur.php',
		data: {
			action: "ajouterFinAuto",
			heureFin: heureActuelleFin
		},
		success: function()
		{
			$('#btnFinish').attr('disabled', 'disabled');
			$('#btnStart').removeAttr('disabled');
			recuperationBDD();				
		}, 
		error: function()
		{
			console.log('erreur ajax');
		}
	});
});

