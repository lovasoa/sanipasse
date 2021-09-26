<script lang="ts">
	const code_example = {
		key: 'XXXX',
		code: 'HC1:...'
	};
</script>

<h1>API de vérification des pass sanitaires</h1>
<h2>
	<small class="text-muted">
		Intégrez la vérification de passes sanitaires à votre application en 5 minutes de développement
	</small>
</h2>

<figure class="border-start my-5 px-3">
	<blockquote class="blockquote fst-italic">
		<p>
			J'aimerais bien passer des heures à implémenter base45, CBOR, COSE, et 3 algorithmes
			différents de signature numérique
		</p>
	</blockquote>
	<figcaption class="blockquote-footer">Personne, jamais</figcaption>
</figure>

<p>
	<i>Sanipasse.fr</i> expose désormais une API HTTP pour vérifier les passes sanitaires. Elle permet
	de faire décoder et vérifier des passes par le serveur de sanipasse, tout en respectant les
	<a href="/apropos">engagements de sécurité et de respect de la vie privée</a> de sanipasse.
</p>

<h3 class="mt-4">Comment utiliser l'API ?</h3>

<h5 class="mt-3">Extraire la forme textuelle du passe sanitaire</h5>
<p>
	L'API de sanipasse propose uniquement le décodage de la forme textuelle des passes sanitaires. Il
	vous faut donc d'abord utiliser une bibliothèque de détection et de lecture des QR codes. Vous
	pouvez utiliser pour cela n'importe laquelle des bibliothèques de lecture existante, comme par
	exemple la bibliothèque libre <a
		href="https://github.com/zxing/zxing#project-in-maintenance-mode-only">ZXing</a
	>.
</p>
<p>
	Lorsque vous décodez un passe sanitaire européen, vous obtenez une suite de lettres et de chiffres
	qui commence par <code>HC1:</code>. C'est cette chaîne de caractères que vous devrez fournir à
	sanipasse.
</p>
<p>
	<strong>Attention</strong>: Avant d'utiliser l'API, assurez-vous d'avoir correctement décodé le QR
	code ou le <a href="https://en.wikipedia.org/wiki/Data_Matrix">DataMatrix</a>. Les codes
	datamatrix contiennent notemment des
	<a
		href="https://fr.wikipedia.org/wiki/American_Standard_Code_for_Information_Interchange#Caract%C3%A8res_de_contr%C3%B4le"
		>caractères de contrôle</a
	>, invisibles, que certains lecteurs physiques ne lisent pas correctement. Pour vous assurer que
	vous avez bien décodé un code, vous pouvez le réencoder en QR code ou en datamatrix, et vérifier
	que l'image résultante peut bien être scannée dans sanipasse ou dans TousAntiCovid-Verif.
</p>
<h5 class="mt-3">Obtenir une clef d'API</h5>
<p>
	L'API demande de s'authentifier pour vérifier les passes sanitaires. Pour vous authentifier, il
	vous faut fournir une clef unique, qui vous sera fournie si vous en faites la demande à
	<a href="mailto:contact@ophir.dev?subject=Demande de clef pour l'API sanipasse"
		>contact@ophir.dev</a
	>. Pour la suite, nous supposerons que vous avez une clef valide, que nous définirons pour cette
	démonstration à <code>XXXX</code>.
</p>

<h5 class="mt-3">Envoyer une requête</h5>
<p>Pour vérifier un passe, il faut envoyer une requête <code>POST</code> à l'adresse</p>
<p><code>https://sanipasse.fr/api/validate_pass</code></p>
<p>avec le Content-Type <code>application/json</code> et le corps de requête JSON suivant:</p>
<pre>
    {JSON.stringify(code_example, null, '  ')}</pre>
<p>Pour tester l'API en ligne de commande, on peut utiliser curl:</p>
<p>
	<code
		>curl https://sanipasse.fr/api/validate_pass -H 'Content-Type: application/json' --data '{JSON.stringify(
			code_example
		)}' -v
	</code>
</p>

<p>
	ou python, avec la bibliothèque <a href="https://docs.python-requests.org/en/latest/">requests</a
	>:
</p>
<pre><code>
import requests

validation = requests.post(
	'https://sanipasse.fr/api/validate_pass',
	json={JSON.stringify(code_example)}
).json()
</code></pre>

<h5>Interpréter le résultat</h5>
<p>
	Si la vérification fonctionne, quel qu'en soit le résultat (code valide ou non), l'API retournera
	un code HTTP 200.
</p>
<h6>Pour un code <strong>valide</strong></h6>
<p>
	Si le passe est valide, l'API retourne les informations nécessaires à la vérification d'identité
	de son porteur au format JSON
</p>
<pre>{`{
    "validated": true,
    "person": {
        "first_name": "PIERRE",
        "last_name": "LEGENDRE",
        "date_of_birth": "1990-01-01T00:00:00.000Z"
    }
}`}</pre>

<h6>Pour un code <strong>invalide</strong></h6>
<p>Si le passe est invalide, l'API retourne un message expliquant pourquoi le passe est invalide</p>
<pre>{`{
    "validated": false,
    "error":"Vous n'avez reçu que 1 dose sur les 2 que ce vaccin demande.",
    "person": {
        "first_name":"PIERRE",
        "last_name":"LEGENDRE",
        "date_of_birth":"1990-01-01T00:00:00.000Z"
    }
}`}</pre>
<p>
	L'object <i>person</i> peut ne pas être présent si le passe présenté n'a pas un format correct.
</p>

<style>
	pre {
		color: #d63384;
		background-color: #f8f8f8;
		border-radius: 5px;
		padding: 1rem;
		border-left: 3px solid grey;
	}
</style>
