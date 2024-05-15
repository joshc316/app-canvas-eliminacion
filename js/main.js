const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#AECAAF";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
        this.collisionTimer = 0; // Temporizador para mantener el color rojo después de la colisión
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context, circles) {
        this.draw(context);

        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Revisar límites de la pantalla para rebote
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if ((this.posY - this.radius) < 0 || (this.posY + this.radius) > window_height) {
            this.dy = -this.dy;
        }

        // Verificar colisiones con otros círculos
        let collided = false;
        for (let otherCircle of circles) {
            if (this !== otherCircle) {
                let distance = getDistance(this.posX, otherCircle.posX, this.posY, otherCircle.posY);
                if (distance < (this.radius + otherCircle.radius)) {
                    // Cambiar dirección de este círculo
                    let angle = Math.atan2(otherCircle.posY - this.posY, otherCircle.posX - this.posX);
                    this.dx = -Math.cos(angle) * this.speed;
                    this.dy = -Math.sin(angle) * this.speed;

                    // Cambiar dirección del otro círculo
                    let otherAngle = Math.atan2(this.posY - otherCircle.posY, this.posX - otherCircle.posX);
                    otherCircle.dx = -Math.cos(otherAngle) * otherCircle.speed;
                    otherCircle.dy = -Math.sin(otherAngle) * otherCircle.speed;

                    collided = true;
                    break;
                }
            }
        }

        // Establecer temporizador y cambiar color a rojo si hay colisión
        if (collided) {
            this.color = "red";
            this.collisionTimer = 10; // Duración en frames (60 frames = 1 segundo)
        }

        // Decrementar el temporizador y cambiar el color de vuelta a azul cuando el temporizador llegue a cero
        if (this.collisionTimer > 0) {
            this.collisionTimer--;
            if (this.collisionTimer === 0) {
                this.color = "blue";
            }
        }
    }
}

function getDistance(x1, x2, y1, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

let circles = [];

// Crear 20 círculos aleatorios
for (let i = 0; i < 20; i++) {
    let radius = Math.random() * 50 + 20; // Radio entre 20 y 70
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;
    let speed = 3; // Velocidad constante
    let text = (i + 1).toString(); // Números del 1 al 20
    let color = "blue"; // Todos azules al inicio

    let circle = new Circle(x, y, radius, color, text, speed);
    circles.push(circle);
}

let updateCircles = function() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);

    for (let circle of circles) {
        circle.update(ctx, circles);
    }
};

// Iniciar la animación
updateCircles();

// Agregar evento de clic del mouse al lienzo
canvas.addEventListener("click", function(event) {
    // Obtener las coordenadas del clic del mouse
    let mouseX = event.clientX;
    let mouseY = event.clientY;

    // Verificar si el clic del mouse está dentro de algún círculo
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];
        let distance = getDistance(mouseX, circle.posX, mouseY, circle.posY);
        if (distance <= circle.radius) {
            // Eliminar el círculo de la lista
            circles.splice(i, 1);
            break; // Detener la iteración una vez que se elimina el círculo
        }
    }
});
