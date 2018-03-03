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
    $("#form").fadeIn('slow');
    $('#btnHoraires').css('display', 'none'); 
    var dateSelectionnee = $(mot).text(); //on récupère la date du jour cliqué
    $("#champCache").val(dateSelectionnee); //et on le met dans l'input hidden pour le transmettre lors de l'appel ajax à la BDD

    $('.titre').on('click', function() //quand on clique ailleurs sur la page, le formulaire disparait
    {
        $('#form').css("display", "none");
        $('#btnHoraires').fadeIn(1000, 'linear');
    });
}

function afficherPlanning(data) //affiche les horaires présents en base de données
{
    var donneesRecues = JSON.parse(data);
    $(".description").empty(); //on vide toutes les cases
    totalTableau = [0, 0, 0, 0, 0, 0, 0]; // création du tableau en prévision du calcul du nb d'heures effectuées

    for (var j = 0; j < semaineTableau.length; j++) // pour chaque jour de la semaine
    {
        for (var i = 0; i < donneesRecues.length; i++) // parcours les résultats reçus de la requête
        {
            if (donneesRecues[i]['date'] == getAffichageCorrect(semaineTableau[j]))
            {
                var id = donneesRecues[i]['id']; 
                var heureDebut = donneesRecues[i]['heureDebut'];
                var heureFin = donneesRecues[i]['heureFin'];
                if (heureFin == null) //si la session est en cours
                {
                    heureFin = 0;
                    debutSession = heureDebut;
                    $('#compte_a_rebours').css('display', 'block');
                    compte = setInterval(function(){
                                    sessionEnCours();
                            },1000);
                }
                else if(heureFin)
                {
                    clearInterval(compte);
                    $('#heuresAFaire').empty();
                    $('#heuresAFaireJour').empty();
                    $('#compte_a_rebours').css('display', 'none');
                    $('h1').css('border', 'none');
                    $('#sessionActive').empty();
                }

                calculHeureJour();
                var h1 = parseInt(heureDebut.substr(0,2)); // je récupère l'heure de début (uniquement l'heure, les minutes sont dans m1)
                var m1 = parseInt(heureDebut.substr(3,2));// je récupère les minutes de début (uniquement les minutes, les heures sont dans h1)

                var h2 = 0; 
                var m2 = 0;
                var bonneHeureFin = "?";
                var ecart=0;

                if (heureFin != 0) //Si l'heure de fin est notée (déjà appuyé sur le btn "terminer")
                {
                    h2 = parseInt(heureFin.substr(0,2)); 
                    m2 = parseInt(heureFin.substr(3,2));
                    bonneHeureFin = heureFin.substr(0,5);
                    var mtotal1 = h1*60+m1; //je convertis les heures en minutes puis je les additionne aux minutes que j'avais au début
                    var mtotal2 = h2*60+m2;
                    ecart = mtotal2-mtotal1; // je soustrais l'horaire de fin à l'horaire de début pour connaitre combien de temps il s'est écoulé (en minutes)
                }
                
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

                $('.description').eq(recupBonJour(semaineTableau[j])).append("<div class='horairesAjoutes' onclick='editForm(\"" + bonneHeureDebut + "\", \"" +bonneHeureFin+ "\", \"" +id+ "\");'>"+ bonneHeureDebut + " à " + bonneHeureFin +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class='modif fas fa-pencil-alt'></i></div>"+
                                                                            " = " + "<span class='totalJour'><strong><span class='heure'>" + h + "</span>h<span class='minutes'>" + mm + "</span></strong></span><br/><span class='idCache'>"+id+"</span><br/>");
                
                totalTableau[j] += ecart; // j'ajoute dans la case j du tableau l'écart correspondant
            }
        }      
    }

    calculHeureSemaine(0);
    calculHeureJour(0);
}

function calculHeureSemaine(minEffectuees)
{
    var sommeTableau = minEffectuees;
    $('#heuresAFaire').empty(); //on vide le div 

    for (var k = 0; k < totalTableau.length; k++) // addition des écarts de chaque jour de la semaine entre eux
    {
        sommeTableau += totalTableau[k];
    }

    var minAFaireSemaine = 40*60 - parseInt(sommeTableau);
    var minRestantesSemaine = minAFaireSemaine%60; //je convertis en HH:mm
    var heuresRestantesSemaine = (minAFaireSemaine-minRestantesSemaine)/60;

    if (minAFaireSemaine >= (40*60)) //si j'ai travaillé plus de 40h cette semaine
    {
        $('#heuresAFaire').append('rien');
    }
    else
    {
        $('#heuresAFaire').append(heuresRestantesSemaine + " heures et " + minRestantesSemaine + " minutes");
    }
}

/**
* Calcule et affiche le nombre d'heures restantes dans le jour d'aujourd'hui (sur 8h)
*/
function calculHeureJour(minEffectuees) 
{
    $('#heuresAFaireJour').empty(); //on vide le div 

    var minTravailleesAujourdhui = totalTableau[recupBonJour(today)]+minEffectuees; //je récupère le nb d'heures travaillé pour aujourd'hui (en minutes)
    var minAFaireAujourdhui = 8*60 - parseInt(minTravailleesAujourdhui); //je calcule l'écart
    var mRestantesJour = minAFaireAujourdhui%60; //je convertis en hh:mm
    var hRestantesJour = (minAFaireAujourdhui-mRestantesJour)/60;

    if (minAFaireAujourdhui >= (8*60)) //si j'ai travaillé plus de 8h
    {
        $('#heuresAFaireJour').append('rien');
    }
    else
    {
        $('#heuresAFaireJour').append(hRestantesJour + " heures et " + mRestantesJour + " minutes");
    }
}

function sessionEnCours()
{
    $('#compte_a_rebours').empty();
    $('h1').css('border', '2px black solid');
    $('#btnStart').attr('disabled', 'disabled');
    $('#btnFinish').removeAttr('disabled');
    var now = new Date();
    var debutSessionFormatee = new Date(anneeActuelle + "-" + moisActuel + "-" + jourActuel +"T"+debutSession);//je met en bon format l'heure de départ pour faliciter la suite des opérations
    var total_secondes = (now - debutSessionFormatee)/1000; //je mets la différence en secondes
    var jours = Math.floor(total_secondes / (60 * 60 * 24)); //conversions en jours (inutile), heures, minutes
    var heures = Math.floor((total_secondes - (jours * 60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((total_secondes - ((jours * 60 * 60 * 24 + heures * 60 * 60))) / 60);
    var secondes = Math.floor(total_secondes - ((jours * 60 * 60 * 24 + heures * 60 * 60 + minutes * 60)));
    var et = "et";
    var mot_jour = "jours,";
    var mot_heure = "heures,";
    var mot_minute = "minutes,";
    var mot_seconde = "secondes";

    if (jours == 0) //il le sera toujours normalement, on décide donc de ne pas l'afficher
    {       
        jours = '';
        mot_jour = '';
    }
    if (heures == 0) //mise en forme
    {
        heures = '';
        mot_heure = '';
    }
    else if (heures == 1)
    {
        mot_heure = "heure,";
    }

    if (minutes == 0)
    {
        minutes = '';
        mot_minute = '';
    }
    else if (minutes == 1)
    {
        mot_minute = "minute,";
    }

    if (secondes == 0)
    {
        secondes = ''
        mot_seconde = '';
        et = '';
    }
    else if (secondes == 1)
    {
        mot_seconde = "seconde";
    }

    if (minutes == 0 && heures == 0 && jours == 0)
    {
        et = "";
    }

    //mise en forme 
    $('#compte_a_rebours').append(prefixe + jours + ' ' + mot_jour + ' ' + heures + ' ' + mot_heure + ' ' + minutes + ' ' + mot_minute + ' ' + et + ' ' + secondes + ' ' + mot_seconde + "!");      
    calculHeureJour(total_secondes/60);
    calculHeureSemaine(total_secondes/60);
}

//fonction appelée quand on clique sur un horaire du tableau
function editForm(heurededebut, heuredefin, id)
{
    $("#formEdite").fadeIn('slow'); // on fait apparaitre le formulaire
    $('#btnHoraires').css('display', 'none'); 
    $('#boutonValidationEdite').removeAttr('disabled');
    $('#heureDebutEdite').val(heurededebut); //on met les anciens horaires dans le form pour qu'ils s'affichent, puis dans les champs cachés
    $('#heureFinEdite').val(heuredefin);
    $('#champCacheEdite').val(id);
    $('#champCache3Edite').val(heurededebut);
    $('#champCache4Edite').val(heuredefin);

    var dateCorrecte = $(heurededebut).find('.description').parent().find('.titre').val(); // récupération de la date

    $('.titre').on('click', function() //quand on clique ailleurs sur la page, le formulaire disparait
    {
        $('#formEdite').css("display", "none");
        $('#btnHoraires').fadeIn(1000, 'linear');
    });

    $('#formEdite').submit(function(e){
        var dato = $(this).serialize();
        $("#heureDebutEdite, #heureFinEdite").val(''); // vide les input
        $("#boutonValidationEdite").attr('disabled', 'disabled'); //remet le bouton disable
        e.preventDefault(); // Annulation de l'envoi des données via le formulaire (car on le fait via ajax)
        $.ajax({
            type : "POST",
            url: 'controleur.php',
            dataType: 'json',
            data: dato,
            success : function() {
                recuperationBDD();
                $("#formEdite").delay(1000).fadeOut(1000, "linear");  
                $("#confirmationEnvoiEdite").html("Bien enregistré"); // message de validation
                $("#confirmationEnvoiEdite").delay(1000).fadeOut(1000, 'linear'); 
                $('#btnHoraires').delay(1000).fadeIn(1000, "linear"); 
            },
            error: function() {
                $("#formEdite").delay(1000).fadeOut(1000, "linear"); 
                $("#confirmationEnvoiEdite").html("Erreur d'appel Ajax");
                $("#confirmationEnvoiEdite").delay(1000).fadeOut(100, 'linear'); 
            }
        });
    });
}

function presenterHeure(dateAPresenter)
{
    var heure = dateAPresenter.getUTCHours()+1;
    var minute = dateAPresenter.getUTCMinutes();
    var seconde = dateAPresenter.getUTCSeconds();

    if (seconde < 10) 
    {
        seconde = "0"+seconde;
    }

    if (minute < 10) 
    {
        minute = "0"+minute;
    }

    if (heure < 10) 
    {
        heure = "0"+heure;
    }

    return heure + ":" + minute + ":" + seconde;
}


// Date du jour
var today = new Date();
var jourSelectionne = today;
var totalTableau = [0, 0, 0, 0, 0, 0, 0]; // création du tableau en prévision du calcul du nb d'heures effectuées
var jourActuel = today.getUTCDate();
if (jourActuel < 10) // mise en forme
{
    jourActuel = "0"+jourActuel;
}
var moisActuel = today.getUTCMonth()+1;
if (moisActuel < 10) 
{
    moisActuel = "0"+moisActuel;
}
var anneeActuelle = today.getUTCFullYear();
var semaineTableau = calculSemaine(jourSelectionne);
afficheSemaine(semaineTableau);
var debutSession = "";
var heureNow = "";
var prefixe = "Tu travailles depuis ";
var compte = "";
var heuresRestantesJour = "";
var heuresRestantes = "";

$("#heureDebut, #heureFin").on("change paste keyup", function() { //rend le bouton de validation cliquable dès qu'on écrit dans les input associés
   $("#boutonValidation").removeAttr('disabled');
});

// Quand on clique sur flèche droite pour afficher la semaine suivante
$( "#flecheDroite" ).click(function() {
    $("#grilleContenu").empty(); // On vide le div de la grille
    jourSelectionne = jourSelectionne.addDays(7); //on rajoute 7 jours à la semaine actuelle 
    semaineTableau = calculSemaine(jourSelectionne);
    afficheSemaine(semaineTableau); 
    recuperationBDD();
});

// Quand on clique sur flèche gauche pour afficher la semaine précédente
$( "#flecheGauche" ).click(function() {
    $("#grilleContenu").empty(); // On vide le div de la grille
    jourSelectionne = jourSelectionne.addDays(-7); //on rajoute 7 jours à la semaine actuelle 
    semaineTableau = calculSemaine(jourSelectionne);
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
            $("#form").delay(1000).fadeOut(1000, "linear");  
            $("#confirmationEnvoi").html("Bien enregistré"); // message de validation
            $("#confirmationEnvoi").delay(1000).fadeOut(1000, 'linear'); 
            $('#btnHoraires').delay(1000).fadeIn(1000, "linear"); 
        },
        error: function() {
            $("#form").delay(1000).fadeOut(1000, "linear"); 
            $("#confirmationEnvoi").html("Erreur d'appel Ajax");
            $("#confirmationEnvoi").delay(1000).fadeOut(100, 'linear'); 
        }
    });
});

// Quand on clique sur le bouton "commencer"
$('#btnStart').click(function(){
    var heureActuelleDebut = presenterHeure(new Date());
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

