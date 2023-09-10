const NUMBER_OF_BOMBS = 400;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 40;
const BOX_SIZE = 20;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function range(n) {
	return new Array(n).fill(0).map((_, i) => i);
}

function drawGrid(fill, stroke) {
	ctx.fillStyle = fill;
	ctx.strokeStyle = stroke;
	for (let i = 0; i < MAP_WIDTH; i++) 
	for (let j = 0; j < MAP_HEIGHT; j++) {
		ctx.fillRect(i*BOX_SIZE, j*BOX_SIZE, BOX_SIZE, BOX_SIZE);
		ctx.strokeRect(i*BOX_SIZE, j*BOX_SIZE, BOX_SIZE, BOX_SIZE);
	}
}

const bombs = range(NUMBER_OF_BOMBS).map(() => [Math.floor(Math.random() * MAP_HEIGHT), Math.floor(Math.random() * MAP_WIDTH)]);

function drawBombs() {
	ctx.fillStyle = "rgb(0, 0, 0)";
	bombs.forEach(([x, y], ) => {
		ctx.font = "18px sans";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x * BOX_SIZE + BOX_SIZE / 2, y * BOX_SIZE + BOX_SIZE / 2, 6, 0, Math.PI * 2);
	});
}

let covers = new Array(MAP_WIDTH).fill(0).map((_, x) => new Array(MAP_HEIGHT).fill(0).map((_, y) => [x, y]));

function drawCover() {
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.strokeStyle = "0, 0, 0";
	covers.forEach((row) => {
		row.forEach(([x, y]) => {
			ctx.fillRect(x * BOX_SIZE, y * BOX_SIZE, BOX_SIZE, BOX_SIZE);
			ctx.strokeRect(x * BOX_SIZE, y * BOX_SIZE, BOX_SIZE, BOX_SIZE);
		});
	});
}

counts = range(MAP_WIDTH).map((_, x) => range(MAP_HEIGHT).map((_, y) => bombs.some(([a, b]) => a == x && b == y) ? "bomb" : 0));

console.table(counts);

function neighbors(list, x, y) {
	return range(3).flatMap((xOffset) => {
		return range(3).flatMap(yOffset => {
			if (xOffset === 1 && yOffset === 1) return;

			return list[x + xOffset - 1]?.[y + yOffset - 1] !== undefined ? [[x + xOffset - 1, y + yOffset - 1]] : [];
		}).filter(vec => !!vec?.length);
	});
}

function calculateGridOfNumbers() {
	bombs.forEach(([x, y]) => {
		neighbors(counts, x, y).forEach(([x, y]) => {
			if (counts[x][y] === "bomb") return;
			counts[x][y] += 1;
		})
	});
}

function drawCounts() {
	ctx.font = "18px sans";
	counts.forEach((row, x) => {
		row.forEach((count, y) => {
			if (count === "bomb" || count === 0) return;
			ctx.fillText(count.toString(), x * BOX_SIZE + 4, y * BOX_SIZE + BOX_SIZE - 4)
		})
	})
}

function addClickEvent(f) {
	const eventListener = canvas.addEventListener("click", (e) => {
		const x = e.pageX - canvas.offsetLeft - canvas.clientLeft;
		const y = e.pageY - canvas.offsetTop - canvas.clientTop;

		f(Math.floor(x / BOX_SIZE), Math.floor(y / BOX_SIZE));
	}, false);

	return eventListener;
}

function removeCover() {
	function getCoversToRemove(x, y) {
		if (counts[x][y] !== 0) return [[x, y]];

		const stack = neighbors(counts, x, y);
		const visited = [];
		while (!!stack.length) {
			const option = stack.splice(0, 1)?.[0];
			if (visited.some(([x, y]) => x === option[0] && y === option[1])) continue;

			visited.push(option);

			if (counts[option[0]][option[1]] !== 0) continue;

			stack.push(...neighbors(counts, ...option));
		}

		return visited;
	}

	addClickEvent((x, y) => {
		console.log(x, y);
		getCoversToRemove(x, y).forEach(([x, y]) => {
			covers = covers.map(row => 
				row.filter(([a, b]) => a != x || b != y)
			);
		});
	});
}

function updateBoard() {
	addClickEvent(() => drawLoop());
}

function drawLoop() {
	drawGrid("rgb(180, 180, 180)", "rgb(0, 0, 0)");
	drawBombs();
	drawCounts();
	drawCover();
}

calculateGridOfNumbers();
removeCover();
drawLoop();
drawLoop();
updateBoard();
