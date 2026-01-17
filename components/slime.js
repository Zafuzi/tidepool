function slime() {
	let slime_img = assets["data/slime1.png"];
	let slime_collide_sound = assets["data/plink.ogg"];

	let sq = new Squid(vec(Math.random() * screen.x, Math.random() * screen.y), slime_img);
	const randx = Math.random()
	const randy = Math.random()
	sq.speed = Math.random();
	sq.velocity.x = randx > 0.5 ? sq.speed : -sq.speed;
	sq.velocity.y = randy > 0.6 ? sq.speed : -sq.speed;

	sq.listen("tick", function () {
		if (sq.position.x + slime_img.size().x / 2 - 8 > screen.x) {
			sq.velocity.x = -sq.speed;
		}

		if (sq.position.x - 8 <= 0) {
			sq.velocity.x = sq.speed;
		}

		if (sq.position.y + slime_img.size().y / 2 > screen.y) {
			sq.velocity.y = -sq.speed;
		}

		if (sq.position.y - 12 <= 0) {
			sq.velocity.y = sq.speed;
		}

		sq.rotation += degrees2radians(sq.velocity.x + sq.velocity.y * 0.4);
	});
	
	return sq;
}
