let video;
let handpose;
let previsoes = [];

function SecurityPolicyViolationEvent(){
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);

    handpose = ml5.handpose(video, modelCarregado);

    handpose.on("predict", results => {
        previsoes = results;
    });

    video.hide();
}

function modelCarregado(){
    console.log("Modelo Carregado!");
}

function draw(){
    image(video, 0, 0, width, height);

    desenharPontos();
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