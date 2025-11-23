//  Fonction permettant de remplir une zone fermé à partir d'un pixel de départ d'une couleur donnée
function floodFill(ctx, startX, startY, fillColor) {
    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const stack = [[startX, startY]];

    function getIndex(x, y) {
        return (y * w + x) * 4;
    }

    // Couleur à remplacer (celle du pixel de départ)
    const idxStart = getIndex(startX, startY);
    const targetColor = [
        data[idxStart],
        data[idxStart + 1],
        data[idxStart + 2],
        data[idxStart + 3]
    ];

    function colorsMatch(i) {
        return (
            data[i] === targetColor[0] &&
            data[i+1] === targetColor[1] &&
            data[i+2] === targetColor[2] &&
            data[i+3] === targetColor[3]
        );
    }

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const i = getIndex(x, y);

        if (!colorsMatch(i)) continue;

        // Remplace la couleur
        data[i]   = fillColor[0];
        data[i+1] = fillColor[1];
        data[i+2] = fillColor[2];
        data[i+3] = 255;

        // Ajout des voisins
        if (x > 0) stack.push([x - 1, y]);
        if (x < w - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < h - 1) stack.push([x, y + 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

// Fonction anti-antialiasing
function binarizeCanvas(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const seuil = 128;

    for (let i = 0; i < d.length; i += 4) {
        const v = d[i]; // canal rouge (R=G=B sur un trait noir)

        if (v < seuil) {
            d[i] = d[i+1] = d[i+2] = 0;   // noir
        } else {
            d[i] = d[i+1] = d[i+2] = 255; // blanc
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

// 1️⃣ Récupération du canvas "esthétique" et "technique"
const canvas = document.getElementById("zone");
const ctx = canvas.getContext("2d",{ willReadFrequently: true });

const techCanvas = document.getElementById("tech");
const techCtx = techCanvas.getContext("2d",{ willReadFrequently: true });

// 2️⃣ Redimensionner le canvas à la taille de la fenêtre
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fond blanc
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    techCanvas.width = window.innerWidth;
    techCanvas.height = window.innerHeight;

    techCtx.fillStyle = "white";
    techCtx.fillRect(0, 0, canvas.width, canvas.height);
}

// Fonction pour tracer la cible 
function tracer_cible(ctx){
    let x = canvas.width
    let y = canvas.height
    const L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000];
    const L_secteur = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];

    for (let i = 0; i<7 ;i++) {
        // Sur la cible esthétique
        ctx.beginPath();
        ctx.arc(x/4, y/2, L_rayon[i], 0, Math.PI * 2); 
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    for (let i=0 ; i<20 ;i++) {
        const angle = 2*i*Math.PI/20 - Math.PI/20;
        const x_deb = x/4 + Math.cos(angle)*L_rayon[1];
        const x_fin = x/4 + Math.cos(angle)*L_rayon[5];
        const y_deb = y/2 + Math.sin(angle)*L_rayon[1];
        const y_fin = y/2 + Math.sin(angle)*L_rayon[5];
        // Sur la cible esthétique
        ctx.beginPath();       // Commence un nouveau chemin
        ctx.moveTo(x_deb, y_deb);    // Déplace le "crayon" au point de départ
        ctx.lineTo(x_fin, y_fin);    // Trace une ligne jusqu'au point d'arrivée
        ctx.strokeStyle = "black"; // Couleur de la ligne
        ctx.lineWidth = 2;         // Épaisseur de la ligne
        ctx.stroke();    
    }
}

// Fonction pour remplir la cible :
function remplir_cible_esthetique(ctx) {
    let y = canvas.height;
    let x = canvas.width;
    const L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000];
    const vert = [30,168,43,255];
    const rouge = [237,28,36,255];
    const noir = [30,30,30,255];
    for (let i=0; i<10 ; i++) {
        angle_noir = 2*Math.PI/20 + 2*i*2*Math.PI/20;
        x_4 = Math.floor(x/4 + (L_rayon[5]+L_rayon[4])/2*Math.cos(angle_noir));
        y_4 = Math.floor(y/2 + (L_rayon[5]+L_rayon[4])/2*Math.sin(angle_noir));
        floodFill(ctx,x_4,y_4,rouge);

        x_3 = Math.floor(x/4 + (L_rayon[3]+L_rayon[4])/2*Math.cos(angle_noir));
        y_3 = Math.floor(y/2 + (L_rayon[3]+L_rayon[4])/2*Math.sin(angle_noir));
        floodFill(ctx,x_3,y_3,noir);

        x_2 = Math.floor(x/4 + (L_rayon[2]+L_rayon[3])/2*Math.cos(angle_noir));
        y_2 = Math.floor(y/2 + (L_rayon[2]+L_rayon[3])/2*Math.sin(angle_noir));
        floodFill(ctx,x_2,y_2,rouge);
        
        x_1 = Math.floor(x/4 + (L_rayon[2]+L_rayon[1])/2*Math.cos(angle_noir));
        y_1 = Math.floor(y/2 + (L_rayon[2]+L_rayon[1])/2*Math.sin(angle_noir));
        floodFill(ctx,x_1,y_1,noir);

    }
    for (let i=0; i<10 ; i++) {
        angle_noir =  2*i*2*Math.PI/20;
        x_4 = Math.floor(x/4 + (L_rayon[5]+L_rayon[4])/2*Math.cos(angle_noir));
        y_4 = Math.floor(y/2 + (L_rayon[5]+L_rayon[4])/2*Math.sin(angle_noir));
        floodFill(ctx,x_4,y_4,vert);

        x_2 = Math.floor(x/4 + (L_rayon[2]+L_rayon[3])/2*Math.cos(angle_noir));
        y_2 = Math.floor(y/2 + (L_rayon[2]+L_rayon[3])/2*Math.sin(angle_noir));
        floodFill(ctx,x_2,y_2,vert);
        

    }
    // Remplir le centre en rouge
    floodFill(ctx,Math.floor(x/4),Math.floor(y/2),rouge);
    // Remplir la 1ère couronne soit le simple bulle en vert
    floodFill(ctx,Math.floor(x/4),Math.floor(y/2+(L_rayon[0]+L_rayon[1])/2),vert);

}

// Fonction pour remplir la cible :
function remplir_cible_technique(techCtx) {
    let y = canvas.height;
    let x = canvas.width;
    const L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000];
    const L_secteur = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
    for (let i=0; i<20 ; i++) {
        angle =  2*i*Math.PI/20;

        x_triple = Math.floor(x/4 + (L_rayon[3]+L_rayon[2])/2*Math.cos(angle));
        y_triple = Math.floor(y/2 - (L_rayon[3]+L_rayon[2])/2*Math.sin(angle));
        couleur = [10*L_secteur[i]+3,0,0,255]
        floodFill(techCtx,x_triple,y_triple,couleur);

        x_double = Math.floor(x/4 + (L_rayon[4]+L_rayon[5])/2*Math.cos(angle));
        y_double = Math.floor(y/2 - (L_rayon[4]+L_rayon[5])/2*Math.sin(angle));
        couleur = [10*L_secteur[i]+2,0,0,255]
        floodFill(techCtx,x_double,y_double,couleur);

        x_simple1 = Math.floor(x/4 + (L_rayon[1]+L_rayon[2])/2*Math.cos(angle));
        y_simple1 = Math.floor(y/2 - (L_rayon[1]+L_rayon[2])/2*Math.sin(angle));
        couleur = [10*L_secteur[i]+1,0,0,255]
        floodFill(techCtx,x_simple1,y_simple1,couleur);

        x_simple2 = Math.floor(x/4 + (L_rayon[3]+L_rayon[4])/2*Math.cos(angle));
        y_simple2 = Math.floor(y/2 - (L_rayon[3]+L_rayon[4])/2*Math.sin(angle));
        couleur = [10*L_secteur[i]+1,0,0,255]
        floodFill(techCtx,x_simple2,y_simple2,couleur);
    }
    // Remplir le centre en rouge
    floodFill(techCtx,Math.floor(x/4),Math.floor(y/2),[252,0,0,255]);
    // Remplir la 1ère couronne soit le simple bulle en vert
    floodFill(techCtx,Math.floor(x/4),Math.floor(y/2+(L_rayon[0]+L_rayon[1])/2),[251,0,0,255]);
}

function tracer_nbr(ctx) {
    let x = canvas.width;
    let y = canvas.height;
    const L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000];
    const L_secteur = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
    for (let i=0 ; i<20 ;i++) {
        const angle = 2*i*Math.PI/20 ;
        // Affichage des numéros de la cible
        ctx.font = "50px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const x_txt = x/4 + Math.cos(angle)*(L_rayon[5]+L_rayon[6])/2;
        const y_txt = y/2 - Math.sin(angle)*(L_rayon[5]+L_rayon[6])/2;
        ctx.fillText(`${L_secteur[i]}`, Math.floor(x_txt), Math.floor(y_txt));
    }
}

resizeCanvas();
tracer_cible(ctx);
binarizeCanvas(ctx);
remplir_cible_esthetique(ctx);
tracer_nbr(ctx);

tracer_cible(techCtx);
binarizeCanvas(techCtx);
remplir_cible_technique(techCtx);


// Redessiner si la fenêtre change de taille
window.addEventListener("resize", resizeCanvas);


// 4️⃣ Détecter les clics sur le canvas
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // On récupère les données du pixel du canvas technique
    const pixel = techCtx.getImageData(x, y, 1, 1).data;

    const rouge = pixel[0];  // composante rouge

    console.log("Clic sur la cible esthétique :", x, y);
    console.log("Valeur ROUGE du secteur technique =", rouge);
});

// Affichage de la zone de frappe
function montrerInput(id) {
    const inp = document.getElementById(id);
    inp.style.display = "block";
}

function cacherInput(id) {
    const inp = document.getElementById(id);
    inp.style.display = "none";
}

function placerInput(id, x, y) {
    const inp = document.getElementById(id);
    inp.style.left = x + "px";
    inp.style.top = y + "px";
}

function afficher_input(nbr_joueur){
    const x = canvas.width;
    const y = canvas.height;
    for (let i = 1 ; i<=nbr_joueur ; i++){
        placerInput("input"+`${i}`,x*0.7,y*(0.51+0.05*i));
        montrerInput("input"+`${i}`);
    }
    for (let i = nbr_joueur+1 ; i<=6 ; i++){
        cacherInput("input"+`${i}`)
    }
}


// Affichage des menus déroulants
function afficher_menu(){
    const x = canvas.width;
    const y = canvas.height;

    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Mode de jeu", Math.floor(x*3/4), Math.floor(y*1/10));
    ctx.fillText("Nombre de joueurs :", Math.floor(x*3/4), Math.floor(y*5/10));

    const menu1 = document.getElementById("menu1");
    menu1.style.left = (canvas.width * 0.65) + "px";
    menu1.style.top  = (canvas.height * 0.2) + "px";

    const menu2 = document.getElementById("menu2");
    menu2.style.left = (canvas.width * 0.85) + "px";
    menu2.style.top  = (canvas.height * 0.2) + "px";

    const menu3 = document.getElementById("menu3");
    menu3.style.left = (canvas.width * 0.90) + "px";
    menu3.style.top  = (canvas.height * 0.5) + "px";
}
afficher_menu();

let choix_mdj = null;
let nbr_joueur = null;
let L_joueur = [];
menu1.addEventListener("change", () => {
    choix_mdj = menu1.value;
    menu2.value = "0";
});
menu2.addEventListener("change", () => {
    choix_mdj = menu2.value;
    menu1.value = "0";
});
menu3.addEventListener("change", () => {
    if (menu3.value === "--"){
        nbr_joueur = null;
    } else {
        nbr_joueur = Number(menu3.value);
    }
    afficher_input(nbr_joueur);
});

const btn = document.getElementById("monBouton");
btn.style.left = canvas.width*0.9 + "px";
btn.style.top = canvas.height*0.9 + "px";

function initialisation_partie(){
    if (menu3.value !== "--" && choix_mdj !== null){
        nbr_joueur = Number(menu3.value); 
        let nbr_joueur_verif = 0;
        for (let i = 1 ; i<= nbr_joueur; i++){
            let texte = document.getElementById(`input${i}`).value;
            if (texte !== ""){
                nbr_joueur_verif++;
                L_joueur.push(texte);
            }
        }
        nbr_joueur = Math.min(nbr_joueur,nbr_joueur_verif);
        console.log(`Les joueurs sont ${L_joueur}`);
        
        // On masque les menus déroulant, les titres et les zones de frappes
        for (let i =1 ; i<=6 ; i++){
            cacherInput("input"+`${i}`)
        }
        for (let i=1 ; i<=3; i++){
            cacherInput(`menu${i}`)
        }
        cacherInput("monBouton")
        ctx.clearRect(0, 0, canvas.width, canvas.height); // efface tout
        resizeCanvas()
        tracer_cible(ctx);
        binarizeCanvas(ctx)
        remplir_cible_esthetique(ctx);

    } 
        
    
}

document.getElementById("monBouton").addEventListener("click", () => {
    initialisation_partie()
});