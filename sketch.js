let video;
let handpose;
let previsoes = [];

let estadoJogo = 0;

//0 é o menu inicial, 2 é o jogo e o 1 é o tutorial

function SecurityPolicyViolationEvent(){
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);

    handpose = ml5.handpose(video, modelCarregado);

    handpose.on("predict", results => {
        previsoes = results;
    });

    video.hide();

    textAlign(CENTER, CENTER);
}

function modelCarregado(){
    console.log("O HandPose está pronto.");
}

function draw(){
    image(video, 0, 0, width, height);

    if(estadoJogo === 0){
        desenharMenu();
    }else if(estadoJogo === 1){
            desenharTutorial();
        } else if(estadoJogo === 2){
            desenharJogo();
        }

    desenharPontos();
}

function desenharMenu(){
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    fill(255);
    textSize(50);
    text("HAND DANCE", width / 2, height / 3);
    textSize(20);

    text("Pressiona 'ENTER' para Iniciar", width / 2, height / 2 + 30);
    text("Pressiona 'T' para o Tutorial", width / 2, height / 2 + 80);
}

function desenharTutorial(){
fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  fill(255);
  textSize(40);
  text("TUTORIAL", width / 2, 80);
  
  // Regras baseadas no teu protótipo 2
  textSize(20);
  text("Faz os gestos para a direção correta:", width / 2, 160);
  text("👆 Indicador = CIMA", width / 2, 220);
  text("👈 Polegar = ESQUERDA", width / 2, 260);
  text("✊ Punho = BAIXO", width / 2, 300);
  text("✋ Mão de lado = DIREITA", width / 2, 340);
  textSize(18);
  fill(200, 200, 200);
  text("Pressiona 'V' para Voltar", width / 2, height - 50);
}

function desenharJogo() {
  desenharPontos();
  
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP); // Alinha o texto à esquerda para a pontuação
  text("Score: 0", 20, 20);
  textAlign(CENTER, CENTER); 
  
  // Aviso de que esta fase ainda está em construção
  textSize(30);
  text("A JOGAR!", width / 2, height / 2);
  
  textSize(16);
  text("Pressiona 'V' para Voltar ao Menu", width / 2, height - 30);
}

function desenharPontos(){
    for (let i=0; i < previsoes.length; i += 1){
        const mao = previsoes[i];

        // percorre todos os pontos da mão
        for (let j = 0; j < mao.landmarks.length; j += 1){
            const ponto  = mao.landmarks[j];
            fill(0, 255, 0);
            noStroke();
            ellipse(ponto[0], ponto[1], 10, 10);
        }
    }
}

//dps tem de se mudar para iniciar com as mãos

function keyPressed(){
    if(estadoJogo === 0){
        if(keyCode === 0){
            estadoJogo = 2;
        } else if (key === 't' || key === 'T'){
            estadoJogo = 1;
        }
    } else if (estadoJogo === 1 || estadoJogo === 2){
        if(key === 'v' || key === ' V'){
                estadoJogo = 0;
        }
    }
}