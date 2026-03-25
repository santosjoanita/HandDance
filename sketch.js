
let video, handpose;

let previsoes = [];

let logo;

let imgSetaCima, imgSetaBaixo, imgSetaEsq, imgSetaDir;

let somAcerto, somErro;



let setas      = [];

let pontuacao  = 0;

let gestoAtual = "NONE";



let estadoJogo = 0; // 0=menu 1=tutorial 2=jogo 3=gameover



let feedback = "", feedbackTimer = 0, feedbackCor;

let velocidadeBase = 1.5;

let nivelAtual     = 1;



const LINHA      = 0.88;

const TEMPO_MAX  = 90;

const MAX_MISSES = 3;



let tempoInicio   = 0;

let tempoRestante = TEMPO_MAX;

let missesSeguid  = 0;

let acertosSeguid = 0;  // sequência de acertos consecutivos

let ultimoTipo    = "";

let repetCount    = 0;



// variáveis para o "carregar nos botões" com o handpose
// Variáveis para o ponteiro gestual
let pontoIndicadorScaled = null; 
let tempoHover = 0; 
const TEMPO_CLIQUE_FRAMES = 60; // 60 frames = 1 segundo a pisar o botão
let botaoSendoHoverado = null;



// menu e tutorial



let particulas = [];

let ondaOffset = 0;



class Particula {

    constructor() { this.reset(true); }



    reset(aleatoria = false) {

        this.x    = random(width);

        this.y    = aleatoria ? random(height) : height + 20;

        this.tam  = random(4, 16);

        this.vel  = random(0.4, 1.4);

        this.cor  = random([

            [255, 80,  200],

            [180, 60,  255],

            [255, 200, 80],

            [80,  200, 255],

            [255, 100, 100],

        ]);

        this.alfa = random(80, 180);

        this.drift = random(-0.4, 0.4);

    }



    update() {

        this.y   -= this.vel;

        this.x   += this.drift;

        this.alfa -= 0.4;

        if (this.y < -20 || this.alfa <= 0) this.reset();

    }



    draw() {

        noStroke();

        fill(this.cor[0], this.cor[1], this.cor[2], this.alfa);

        ellipse(this.x, this.y, this.tam, this.tam);

    }

}



function iniciarParticulas() {

    particulas = [];

    for (let i = 0; i < 60; i++) particulas.push(new Particula());

}



function desenharFundoAnimado() {

    // Ondas de cor no fundo

    ondaOffset += 0.008;

    for (let y = 0; y < height; y += 6) {

        let t    = y / height + ondaOffset;

        let r    = 60  + 30  * sin(t * TWO_PI * 1.3);

        let g    = 0   + 10  * sin(t * TWO_PI * 0.7 + 1);

        let b    = 120 + 50  * sin(t * TWO_PI * 0.9 + 2);

        stroke(r, g, b, 60);

        strokeWeight(6);

        line(0, y, width, y);

    }

    noStroke();



    for (let p of particulas) { p.update(); p.draw(); }



    // Brilhos estáticos aleatórios

    for (let i = 0; i < 5; i++) {

        let bx = noise(i * 10 + ondaOffset) * width;

        let by = noise(i * 10 + ondaOffset + 5) * height;

        let br = 3 + 4 * sin(frameCount * 0.05 + i);

        fill(255, 255, 255, 60 + 40 * sin(frameCount * 0.07 + i));

        noStroke();

        ellipse(bx, by, br, br);

    }

}



function preload() {

    logo         = loadImage("media/logo.png");

    imgSetaCima  = loadImage("media/cima.png");

    imgSetaBaixo = loadImage("media/baixo.png");

    imgSetaEsq   = loadImage("media/esquerda.png");

    imgSetaDir   = loadImage("media/direita.png");

    somAcerto = loadSound("media/correct.mp3");

    somErro = loadSound("media/wrong.mp3");
}



function setup() {

    createCanvas(960, 540);

    video = createCapture(VIDEO);

    video.size(640, 480);

    video.hide();



    handpose = ml5.handpose(video, { maxNumHands: 1 }, () => {

        console.log("HandPose pronto!");

    });

    handpose.on("predict", r => { previsoes = r; });



    textAlign(CENTER, CENTER);

    feedbackCor = color(0, 255, 100);

    iniciarParticulas();

}



function draw() {

    background(75, 0, 130);

    atualizarPonteiroMao();

    if      (estadoJogo === 0) desenharMenu();

    else if (estadoJogo === 1) desenharTutorial();

    else if (estadoJogo === 2) desenharJogo();

    else if (estadoJogo === 3) desenharGameOver();

    desenharFeedbackPonteiro();

}



//  MENU



function desenharMenu() {

    desenharFundoAnimado();

    imageMode(CENTER);

    if (logo) image(logo, width/2, height/2 - 110, 340, 170);

    imageMode(CORNER);



    if (!logo || logo.width === 0) {

        usarFonteBotoes();

        fill(255); textSize(58);

        text("HAND DANCE", width/2, height/2 - 110);

    }



   gerirBotaoGestual("INICIAR",  width/2, height/2 + 55,  260, 56, iniciarJogo);
   gerirBotaoGestual("TUTORIAL", width/2, height/2 + 130, 260, 56, irParaTutorial);

}



//  TUTORIAL



function desenharTutorial() {

    desenharFundoAnimado();



    // Título do Tutorial

    usarFonteBotoes();

    fill(255); textSize(42); textAlign(CENTER, TOP);

    text("TUTORIAL", 290, 30);

    textAlign(CENTER, CENTER);



    let linhas = [

        { img: imgSetaCima,   t1: "CIMA  →  mão aberta para cima",           t2: "       (dedos todos esticados)" },

        { img: imgSetaBaixo,  t1: "BAIXO  →  punho fechado",                 t2: "" },

        { img: imgSetaEsq,    t1: "ESQUERDA  →  indicador aponta à esquerda",t2: "           (outros dedos dobrados)" },

        { img: imgSetaDir,    t1: "DIREITA  →  indicador aponta à direita",  t2: "          (outros dedos dobrados)" },

    ];



    imageMode(CENTER); textAlign(LEFT);

    for (let i = 0; i < linhas.length; i++) {

        let yy = 145 + i * 80;

        if (linhas[i].img) image(linhas[i].img, 60, yy, 48, 48);

       

        usarFonteBotoes();

        fill(255); textSize(17);

        text(linhas[i].t1, 100, yy - (linhas[i].t2 ? 8 : 0));

        if (linhas[i].t2) {

            fill(200); textSize(14);

            text(linhas[i].t2, 100, yy + 16);

        }

    }

    imageMode(CORNER);



    let xV = width - 360, yV = 30;

    desenharVideoComMoldura(xV, yV, 320, 240);

    verificarGesto();



    usarFonteJogo();

    fill(255, 220, 0); textSize(24); textAlign(CENTER);

    text("Gesto: " + gestoAtual, xV + 160, yV + 275);



    fill(255, 220, 100); textSize(16);

    text("Mantém o gesto quando a seta chegar à linha amarela!", width/2, height - 90);



    gerirBotaoGestual("VOLTAR", width/2, height - 45, 200, 48, irParaMenu);

}



//  JOGO

function desenharJogo() {

    desenharVideo(0, 0, width, height);

    verificarGesto();



    fill(0, 0, 0, 100); noStroke();

    rect(0, 0, width, height);



    tempoRestante = TEMPO_MAX - floor((millis() - tempoInicio) / 1000);

    if (tempoRestante <= 0) { tempoRestante = 0; terminarJogo(); return; }



    let yLinha = height * LINHA;



    stroke(255, 235, 0, 220); strokeWeight(4);

    line(0, yLinha, width, yLinha);

    noStroke();



    // Gerar setas

    nivelAtual = 1 + floor(max(pontuacao, 0) / 400);

    let intervalo = max(60, 150 - nivelAtual * 6);

    if (frameCount % intervalo === 0) {

        let tipos = ["CIMA", "BAIXO", "ESQUERDA", "DIREITA"];

        if (repetCount >= 2) tipos = tipos.filter(t => t !== ultimoTipo);

        let novoTipo = random(tipos);

        if (novoTipo === ultimoTipo) repetCount++; else { repetCount=1; ultimoTipo=novoTipo; }

        setas.push(new Seta(novoTipo, velocidadeBase + nivelAtual * 0.3));

    }



    // Setas

    for (let i = setas.length - 1; i >= 0; i--) {

        setas[i].mover();

        setas[i].desenhar(yLinha);



        if (!setas[i].passouLinha && setas[i].y >= yLinha) {

            setas[i].passouLinha = true;

            if (gestoAtual === setas[i].tipo) {

                if (somAcerto) somAcerto.play();

                pontuacao += 100;

                acertosSeguid++;

                mostrarFeedback(mensagemAcerto(acertosSeguid), corAcerto(acertosSeguid));

                setas.splice(i, 1);

            } else {

                if (somErro) somErro.play();

                setas[i].errou = true;

                pontuacao = max(0, pontuacao - 30);

                missesSeguid++;

                acertosSeguid = 0;

                mostrarFeedback("FALHA  " + missesSeguid + "/" + MAX_MISSES, color(255,60,60));

                if (missesSeguid >= MAX_MISSES) { terminarJogo(); return; }

            }

            continue;

        }

        if (setas[i].y > height + 80) setas.splice(i, 1);

    }



    // HUD

    usarFonteBotoes();

    fill(255); textSize(24); textAlign(LEFT);

    text("Pontos: " + pontuacao, 24, 40);

    fill(180, 220, 255); textSize(17);

    text("Nível: " + nivelAtual, 24, 68);

    textAlign(CENTER);



    // Tempo

    usarFonteJogo();

    let corTempo = tempoRestante <= 10 ? color(255,80,80) : color(255,220,0);

    fill(corTempo); textSize(30); textAlign(CENTER);

    text(tempoRestante + "s", width/2, 38);



    desenharCoracoes();



    usarFonteBotoes();

    fill(255, 220, 0); textSize(16); textAlign(RIGHT);

    text("Gesto: " + gestoAtual, width-16, height-18);

    textAlign(CENTER);



    if (feedbackTimer > 0) {

        usarFonteJogo();

        fill(feedbackCor); textSize(68);

        text(feedback, width/2, yLinha - 65);

        feedbackTimer--;

    }



    gerirBotaoGestual("MENU", width-72, 30, 120, 42, irParaMenu);

}



function desenharCoracoes() {

    usarFonteJogo();

    textSize(46); textAlign(LEFT);

    for (let i = 0; i < MAX_MISSES; i++) {

        if (i < MAX_MISSES - missesSeguid) {

            // Coração cheio — vermelho vivo com contorno claro

            fill(255, 60, 110);

            text("\u2665", 24 + i * 52, height - 24);

        } else {

            // Coração gasto — cinzento escuro

            fill(80, 40, 60);

            text("\u2665", 24 + i * 52, height - 24);

        }

    }

    textAlign(CENTER);

}



//  FIM DE JOGO



function terminarJogo() { estadoJogo = 3; }



function desenharGameOver() {

    let pulse = abs(sin(frameCount * 0.04));

    background(lerpColor(color(60,0,100), color(120,0,60), pulse));



    usarFonteJogo();

    fill(255, 80, 80); textSize(76);

    text("FIM DE JOGO", width/2, height/2 - 115);



    let motivo = missesSeguid >= MAX_MISSES ? "3 falhas seguidas!" : "O tempo acabou!";

    fill(255, 200, 80); textSize(26);

    text(motivo, width/2, height/2 - 55);



    fill(255); textSize(44);

    text("Pontuação: " + pontuacao, width/2, height/2 + 18);



    fill(180, 220, 255); textSize(21);

    text("Nível atingido: " + nivelAtual, width/2, height/2 + 62);



    gerirBotaoGestual("JOGAR OUTRA VEZ", width/2, height/2 + 130, 300, 56, iniciarJogo);
    gerirBotaoGestual("MENU",          width/2, height/2 + 202, 300, 56, irParaMenu);

}


//  VÍDEO + PONTOS



function desenharVideo(x, y, larg, alt) {

    push();

    translate(x + larg, y);

    scale(-1, 1);

    image(video, 0, 0, larg, alt);



    if (previsoes && previsoes.length > 0) {

        let escX = larg/640, escY = alt/480;

        let pts  = previsoes[0].landmarks;

        if (pts) {

            let chave = [0, 4, 8, 9, 12, 16, 20];

            for (let i = 0; i < pts.length; i++) {

                let p  = pts[i];

                let px = (Array.isArray(p) ? p[0] : p.x) * escX;

                let py = (Array.isArray(p) ? p[1] : p.y) * escY;

                if (chave.includes(i)) {

                    fill(255,220,0); noStroke(); ellipse(px, py, 11, 11);

                } else {

                    fill(0,200,60,120); noStroke(); ellipse(px, py, 6, 6);

                }

            }

        }

    }

    pop();

}



function mostrarFeedback(msg, cor) {

    feedback = msg; feedbackCor = cor; feedbackTimer = 55;

}



//  FONTE

function usarFonteBotoes() {

    textFont('Arial Black, Impact, sans-serif');

    textStyle(BOLD);

}

function usarFonteJogo() {

    textFont('Impact, Arial Black, sans-serif');

    textStyle(NORMAL);

}



//  MENSAGENS DE STREAK

function mensagemAcerto(streak) {

    if (streak >= 10) return "LENDÁRIO!!";

    if (streak >= 8)  return "IMPARÁVEL!";

    if (streak >= 6)  return "INCRÍVEL!";

    if (streak >= 4)  return "FANTÁSTICO!";

    if (streak >= 2)  return "CONTINUA!";

    return "OK!";

}



function corAcerto(streak) {

    if (streak >= 8)  return color(255, 80,  255); // magenta

    if (streak >= 6)  return color(255, 200, 0);   // dourado

    if (streak >= 4)  return color(100, 255, 150);  // verde claro

    if (streak >= 2)  return color(80,  220, 255);  // azul claro

    return color(0, 255, 120);                      

}



//  GESTOS

function getP(pts, i) {

    let p = pts[i];

    return Array.isArray(p) ? { x:p[0], y:p[1] } : { x:p.x, y:p.y };

}



function verificarGesto() {

    if (!previsoes || previsoes.length === 0) { gestoAtual="NONE"; return; }

    let pts = previsoes[0].landmarks;

    if (!pts || pts.length < 21) { gestoAtual="NONE"; return; }


 // Obter os keypoints de cada dedo e da palma
    let palma   = getP(pts, 9);
    let pulso   = getP(pts, 0);
    let polegar = getP(pts, 4);
    let indic   = getP(pts, 8);
    let medio   = getP(pts, 12);
    let anelar  = getP(pts, 16);
    let mindin  = getP(pts, 20);



    let pontas = [polegar, indic, medio, anelar, mindin];
// Verifica quantos dedos estão esticados para cima (y menor que a palma)
    let cima   = pontas.filter(p => p.y < palma.y - 15).length;
// Verifica quantos dedos estão fechados/apontar para baixo
    let baixo  = pontas.filter(p => p.y > palma.y + 15).length;



    let outrosDobrados = [medio, anelar, mindin]

        .filter(p => Math.abs(p.y - palma.y) < 40).length;

    let dxInd = indic.x - pulso.x;



    if (outrosDobrados >= 2 && Math.abs(dxInd) > 60) {

        gestoAtual = (dxInd > 0) ? "ESQUERDA" : "DIREITA"; return;

    }

    if (cima  >= 4) { gestoAtual = "CIMA";  return; }

    if (baixo >= 4) { gestoAtual = "BAIXO"; return; }

    gestoAtual = "NONE";

}



//  TECLADO

function keyPressed() {

    if (estadoJogo === 0) {

        if (keyCode === ENTER)          iniciarJogo();

        if (key === 't' || key === 'T') irParaTutorial();

    } else if (estadoJogo === 1 || estadoJogo === 2) {

        if (key === 'v' || key === 'V') irParaMenu();

    }

}



//  RATO

function mousePressed() {

    if (estadoJogo === 0) {

        if (botaoClicado(width/2, height/2+55,  260, 56)) iniciarJogo();

        if (botaoClicado(width/2, height/2+130, 260, 56)) irParaTutorial();

    }

    if (estadoJogo === 1) if (botaoClicado(width/2, height-45, 200, 48)) irParaMenu();

    if (estadoJogo === 2) if (botaoClicado(width-72,   30,        120, 42)) irParaMenu();

    if (estadoJogo === 3) {

        if (botaoClicado(width/2, height/2+130, 300, 56)) iniciarJogo();

        if (botaoClicado(width/2, height/2+202, 300, 56)) irParaMenu();

    }

}



function botaoClicado(cx, cy, w, h) {

    return mouseX>cx-w/2 && mouseX<cx+w/2 && mouseY>cy-h/2 && mouseY<cy+h/2;

}



//  NAVEGAÇÃO

function iniciarJogo() {

    setas=[]; pontuacao=0; nivelAtual=1;

    missesSeguid=0; acertosSeguid=0; ultimoTipo=""; repetCount=0;

    tempoInicio=millis(); tempoRestante=TEMPO_MAX;

    estadoJogo=2;

}

function irParaTutorial() { estadoJogo=1; }

function irParaMenu()     { estadoJogo=0; }



//  CLASSE SETA

class Seta {

    constructor(tipo, vel) {

        this.tipo        = tipo;

        this.x           = random(100, width-100);

        this.y           = -60;

        this.velocidade  = vel || 2.5;

        this.passouLinha = false;

        this.errou       = false;

    }



    mover() { this.y += this.velocidade; }



    desenhar(yLinha) {

        let img;

        if (this.tipo === "CIMA")     img = imgSetaCima;

        if (this.tipo === "BAIXO")    img = imgSetaBaixo;

        if (this.tipo === "ESQUERDA") img = imgSetaEsq;

        if (this.tipo === "DIREITA")  img = imgSetaDir;



        let naZona  = this.y > yLinha - 100 && !this.passouLinha;

        let corTint = this.errou ? color(255,60,60,220) :

                      naZona     ? color(255,235,0,230) :

                                   color(255,255,255,255);

        push();

        translate(this.x, this.y);

        imageMode(CENTER);

        if (img) { tint(corTint); image(img,0,0,64,64); noTint(); }

        else {

            usarFonteJogo(); fill(corTint); textSize(48);

            let s = this.tipo==="CIMA"?"\u2191":this.tipo==="BAIXO"?"\u2193":

                    this.tipo==="ESQUERDA"?"\u2190":"\u2192";

            text(s, 0, 0);

        }

        imageMode(CORNER);

        pop();



        if (!this.passouLinha) {

            let prog = constrain(map(this.y, -60, yLinha, 0, 1), 0, 1);

            stroke(naZona ? color(255,220,0) : color(180,100,255));

            strokeWeight(3); noFill();

            rect(this.x-35, this.y+38, 70*prog, 5, 3);

            noStroke();

        }

    }

}

function desenharVideoComMoldura(x, y, larg, alt) {

    let padding = 7;

    let r = 14;

    noStroke();

    fill(0, 0, 0, 60);

    rect(x - padding + 3, y - padding + 4, larg + padding * 2, alt + padding * 2, r);

    stroke(255, 255, 255, 120);

    strokeWeight(2);

    fill(140, 40, 220);

    rect(x - padding, y - padding, larg + padding * 2, alt + padding * 2, r);

    noStroke();

    desenharVideo(x, y, larg, alt);

}

//funções novas após as sugestões

function atualizarPonteiroMao() {
    pontoIndicadorScaled = null; 
    
    if (previsoes && previsoes.length > 0) {
        let pts = previsoes.landmarks;
        
        if (pts && pts.length >= 21) { 
            let indic = getP(pts, 8); 

            // Matemática simples para esticar a posição do vídeo para o ecrã
            let scaledX = (1 - (indic.x / 640)) * width; // O "1 -" serve para fazer o efeito espelho
            let scaledY = (indic.y / 480) * height;
            
            pontoIndicadorScaled = { x: scaledX, y: scaledY };
        }
    }
}
function gerirBotaoGestual(label, x, y, w, h, acaoAAtivar) {
    let mouseOver = mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
    let maoOver = false;

    if (pontoIndicadorScaled) {
        let px = pontoIndicadorScaled.x;
        let py = pontoIndicadorScaled.y;
        maoOver = px > x - w / 2 && px < x + w / 2 && py > y - h / 2 && py < y + h / 2;
    }

    let over = mouseOver || maoOver;

    if (maoOver) {
        if (botaoSendoHoverado === label) {
            tempoHover++; 
            if (tempoHover >= TEMPO_CLIQUE_FRAMES) {
                acaoAAtivar();
                tempoHover = 0; 
                botaoSendoHoverado = null;
            }
        } else {
            botaoSendoHoverado = label;
            tempoHover = 0;
        }
    } else if (botaoSendoHoverado === label) {
        botaoSendoHoverado = null;
        tempoHover = 0;
    }

    // Desenhar a caixa do botão
    noStroke(); fill(0, 0, 0, 60);
    rect(x - w / 2 + 3, y - h / 2 + 4, w, h, 14);
    fill(over ? color(200, 90, 255) : color(140, 40, 220));
    stroke(over ? color(255, 255, 255, 220) : color(255, 255, 255, 120));
    strokeWeight(2);
    rect(x - w / 2, y - h / 2, w, h, 14);
    noStroke();

    // Barra amarela a encher
    if (maoOver && botaoSendoHoverado === label) {
        let progresso = map(tempoHover, 0, TEMPO_CLIQUE_FRAMES, 0, w - 10);
        fill(255, 220, 0, 150);
        noStroke();
        rect(x - w / 2 + 5, y + h / 2 - 12, progresso, 7, 10);
    }

    usarFonteBotoes();
    fill(255); textSize(21);
    text(label, x, y);
}

function desenharFeedbackPonteiro() {
    if (pontoIndicadorScaled) {
        let px = pontoIndicadorScaled.x;
        let py = pontoIndicadorScaled.y;

        push();
        translate(px, py);
        
        noFill(); stroke(0, 60); strokeWeight(3); ellipse(2, 2, 25, 25); 
        stroke(255, 240); ellipse(0, 0, 25, 25); 
        fill(255, 220, 0); noStroke(); ellipse(0, 0, 6, 6); // Centro amarelo

        if (botaoSendoHoverado) {
            noFill(); stroke(255, 220, 0); strokeWeight(4);
            let anguloFinal = map(tempoHover, 0, TEMPO_CLIQUE_FRAMES, -HALF_PI, TWO_PI - HALF_PI);
            arc(0, 0, 25, 25, -HALF_PI, anguloFinal);
        }
        pop();
    }
}