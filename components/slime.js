function slime()
{
	let slime_img = assets["data/slime1.png"];
	let slime_collide_sound = assets["data/plink.ogg"];

	let sq = new Squid(vec(100, 100), slime_img);
		sq.speed = 4;
		sq.velocity.x = sq.speed;
		sq.velocity.y = -sq.speed;

	sq.listen("tick", function()
	{
			if(sq.position.x + slime_img.size().x / 2 - 8 > screen.x)
			{
				sq.velocity.x = -sq.speed;
				slime_collide_sound.play();
			}

			if(sq.position.x - 8 <= 0)
			{
				sq.velocity.x = sq.speed;
				slime_collide_sound.play();
			}

			if(sq.position.y + slime_img.size().y / 2 > screen.y)
			{
				sq.velocity.y = -sq.speed;
				slime_collide_sound.play();
			}

			if(sq.position.y - 12 <= 0)
			{
				sq.velocity.y = sq.speed;
				slime_collide_sound.play();
			}

			sq.rotation += degrees2radians(sq.velocity.x + sq.velocity.y * 0.4);
	});
}