function slime()
{
	let slime_img = assets["data/slime1.png"];
	let sq = new Squid(vec(100, 100), slime_img);
		sq.speed = 4;
		sq.velocity.x = -sq.speed;
		sq.velocity.y = -sq.speed;
	sq.listen("tick", function()
	{
			if(sq.position.x + slime_img.size().x / 2 - 8 > screen.x)
			{
				sq.velocity.x = -sq.speed;
			}

			if(sq.position.x - 8 <= 0)
			{
				sq.velocity.x = sq.speed;
			}

			if(sq.position.y + slime_img.size().y / 2 > screen.y)
			{
				sq.velocity.y = -sq.speed;
			}

			if(sq.position.y - 12 <= 0)
			{
				sq.velocity.y = sq.speed;
			}
		});
}