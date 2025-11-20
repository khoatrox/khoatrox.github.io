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

// 1️⃣ Récupération du canvas
const canvas = document.getElementById("zone");
const ctx = canvas.getContext("2d");

// 2️⃣ Redimensionner le canvas à la taille de la fenêtre
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fond bleu clair
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Fonction pour tracer la cible 
function tracer_cible(){
    let x = canvas.width
    let y = canvas.height
    L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000]
    for (let i = 0; i<7 ;i++) {
        ctx.beginPath();
        ctx.arc(x/4, y/2, L_rayon[i], 0, Math.PI * 2); 
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    for (let i=0 ; i<20 ;i++) {
        const angle = 2*i*Math.PI/20 - Math.PI/20;
        const x_deb = x/4 + Math.cos(angle)*L_rayon[1];
        const x_fin = x/4 + Math.cos(angle)*L_rayon[5];
        const y_deb = y/2 + Math.sin(angle)*L_rayon[1];
        const y_fin = y/2 + Math.sin(angle)*L_rayon[5];
        ctx.beginPath();       // Commence un nouveau chemin
        ctx.moveTo(x_deb, y_deb);    // Déplace le "crayon" au point de départ
        ctx.lineTo(x_fin, y_fin);    // Trace une ligne jusqu'au point d'arrivée
        ctx.strokeStyle = "black"; // Couleur de la ligne
        ctx.lineWidth = 3;         // Épaisseur de la ligne
        ctx.stroke();    
    }
}


// Fonction pour remplir la cible :
function remplir_cible(ctx) {
    let y = canvas.height;
    let x = canvas.width;
    const L_rayon = [y*16/1000,y*34/1000,y*181/1000,y*206/1000,y*334/1000,y*364/1000,y*452/1000];
    const vert = [30,168,43,255];
    const rouge = [237,28,36,255];
    const noir = [30,30,30,255];
    const blanc = [200,200,200,255]
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

        x_3 = Math.floor(x/4 + (L_rayon[3]+L_rayon[4])/2*Math.cos(angle_noir));
        y_3 = Math.floor(y/2 + (L_rayon[3]+L_rayon[4])/2*Math.sin(angle_noir));
        floodFill(ctx,x_3,y_3,blanc);

        x_2 = Math.floor(x/4 + (L_rayon[2]+L_rayon[3])/2*Math.cos(angle_noir));
        y_2 = Math.floor(y/2 + (L_rayon[2]+L_rayon[3])/2*Math.sin(angle_noir));
        floodFill(ctx,x_2,y_2,vert);
        
        x_1 = Math.floor(x/4 + (L_rayon[2]+L_rayon[1])/2*Math.cos(angle_noir));
        y_1 = Math.floor(y/2 + (L_rayon[2]+L_rayon[1])/2*Math.sin(angle_noir));
        floodFill(ctx,x_1,y_1,blanc);

    }
    // Remplir le centre en rouge
    floodFill(ctx,Math.floor(x/4),Math.floor(y/2),rouge);
    // Remplir la 1ère couronne soit le simple bulle en vert
    floodFill(ctx,Math.floor(x/4),Math.floor(y/2+(L_rayon[0]+L_rayon[1])/2),vert);
  
}

resizeCanvas();
tracer_cible();
binarizeCanvas(ctx);
remplir_cible(ctx);





// Redessiner si la fenêtre change de taille
window.addEventListener("resize", resizeCanvas);

// 3️⃣ Message dans la console
console.log("La page est chargée !");
console.log("Canvas dimensions :", canvas.width, "x", canvas.height);

// 4️⃣ Détecter les clics sur le canvas
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log("Clic détecté à :", x, y);
});
