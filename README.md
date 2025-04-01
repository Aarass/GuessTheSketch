# GuessTheSketch
Kako startovati partiju: https://youtu.be/UeR6uw_E4c8

U glavnom package.json fajlu u root folderu postoje skripte za pokretanje fronta i beka.
Za pokretanje baze, postoji docker compose fajl u folderu /packages/server/database/ 

Najlaksi nacin da pokrenes i front i back jeste uz pomoc `bun run all`

Bitna napomena
Ako pokusas da otvoris aplikaciju u dva taba, pomocu istog url-a (npr. localhost:5173) naicices na problem.
Za auth koristimo http cookie. I problem sa njim je sto ga browseri cuvaju na nivou domena.
Tako da ce ga svi tabovi deliti. I tehnicki ces u svim tabovima biti prijavljen kao isti korisnik.
Srecom, skripta koja pokrece front daje 4 adrese ka frontu. Kod mene to izgleda ovako:
```
  VITE v5.4.14  ready in 535 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://100.118.176.65:5173/
  ➜  Network: http://192.168.0.25:5173/
  ➜  Network: http://172.25.128.1:5173/
  ➜  press h + enter to show help
```
Resenje:
jedan tab otvoris na adresi http://localhost:5173/
drugi tab otvoris na adresi http://100.118.176.65:5173/
itd.

Update
Prethodno resenje radi samo na firefox baziranim browserima (Zen, Librewolf, Firefox...)

Problem sa chrome-om je sto ne postavlja cookie-e koji dodju sa veze koja ne koristi tls (citaj nije https).
Medjutim, chrome pravi izuzetak za localhost.
Resenje je da se koristi vise chrome profila. I onda u svakom od profila otvoris tab na localhost.
Jedino je smor sto je svaki profil poseban window.

Moj savet je da instaliras zen browser, jer ima split view.
