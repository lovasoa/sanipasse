<script lang="ts">
	import TooltipFix from '$lib/TooltipFix.svelte';
</script>

<svelte:head>
	<title>The French Health Pass - Sanipasse</title>
	<meta
		name="description"
		content="How does the french health pass work, and what are the privacy tradeoff involved ?"
	/>
</svelte:head>

<main lang="en">
	<h1>How does the french <i>health pass</i> work ?</h1>
	<p>
		Recently, there was a big debate here in France about whether we should have a
		<i>health pass</i> or not. A health pass (<i>passe sanitaire</i>) is a document that proves that
		you have been either vaccinated against or tested negative for COVID-19, and allows you to
		attend large events that were previously forbidden.
	</p>
	<p>
		Last week, the national assembly voted in favor of such a system, and starting june the 9th,
		these passes will be mandatory for all gatherings with over a thousand attendees.
	</p>
	<p>
		In the official announcement, on on the government's website, they say that citizens will have
		to present the pass either as a printed document, or a code in the french government's <i
			>TousAntiCovid</i
		>
		mobile application. And they
		<a href="https://www.gouvernement.fr/pass-sanitaire-toutes-les-reponses-a-vos-questions"
			>pretend</a
		> that depending on who scans the code, they will have access to a different set of information about
		it:
	</p>
	<ul>
		<li>
			The authorities and airline companies' personnel will have access to all the information in
			the pass, including the certificate date, its type (vaccination or test), and in the case of a
			test, the result.
		</li>
		<li>
			Event organizers will have access only to the name and birth date of the subject, and whether
			the entry to the event was validated or not, based on the restrictions for the specific event.
			Nothing else. They will not be able to know whether the document is a PCR screening test
			result, or a vaccination certificate, for instance.
		</li>
	</ul>
	<h2>How can this work ?</h2>
	<p>
		If you think about it from a technical point of view, this seems a little hard to implement
		securely. Would you store the information in the pass itself, or in a database ? If you put it
		in the code, then how would you store the certificate's date so that it can be used by event
		organizers to validate the entry to an event, but not accessed directly ? If you put it in a
		database, the implementation is easier, but you end up with a huge centralised database
		containing identifying information, test results, and vaccination records, which sounds risky,
		and would probably cause public outcry.
	</p>
	<p>
		Now, the underwhelming moment: the actual implementation does not really address this issue. All
		the information is stored in clear text in the pass, and I made an
		<a href="/">open-source scanner</a> that can read all the information in the pass, including the
		pieces that are supposed to be accessible only to the authorities and airline companies. When
		they said that event organizers <i>cannot</i> access all the information, they probably just
		meant <i>are not supposed to</i>.
	</p>
	<h3>Technical details</h3>
	<p>Here is what a test certificate looks like:</p>
	<figure class="figure">
		<a href="/mytest.png" target="_blank"
			><img
				src="/mytest.png"
				class="figure-img img-fluid rounded"
				alt="My test result"
				width="500"
			/></a
		>
		<figcaption class="figure-caption">
			My negative COVID-19 screening test, with the sanitary pass codes.
		</figcaption>
	</figure>
	<p>As you can see, there are two barcodes in two different formats:</p>
	<ul>
		<li>
			A <b>QR code</b> containing the text
			<code
				>https://bonjour.tousanticovid.gouv.fr/app/wallet?v=DC04FR03AHP11E691E69B201FRF0OPHIR%1DF1LOJKINE%1DF216041994F3MF4945006%1DF5NF6240420210929%1F7N6GCZR3FHC3JL2WYDE4LQ3GHG7TJAK3U6RLBPZJYHK43KJDJA32RUZTXG2LVDKNVYXFL6YPP2TPWMVGPB3H7MNZUTE7X3GN3RZHCUY</code
			>
		</li>
		<li>
			A <a href="https://en.wikipedia.org/wiki/Data_Matrix">Data Matrix</a> containing the same
			information, but without the link:
			<code
				>DC04

				<TooltipFix><span slot="target">FR03</span>ID of the certificate authority</TooltipFix>

				<TooltipFix
					><span slot="target">AHP1</span>ID of the signing key used to sign the document</TooltipFix
				>

				<TooltipFix><span slot="target">1E69</span>Creation date of the document</TooltipFix>

				<TooltipFix><span slot="target">1E69</span>Date of the signature of the document</TooltipFix
				>

				<TooltipFix><span slot="target">B2</span>Document type (B2 = test, L1 = vaccine)</TooltipFix
				>

				01

				<TooltipFix><span slot="target">FR</span>Country Code</TooltipFix>

				F0 OPHIR
				<abbr title="ASCII control character 29 (group separator)">\x1D</abbr>
				F1 LOJKINE
				<abbr title="ASCII control character 29 (group separator)">\x1D</abbr>

				<TooltipFix>
					<span slot="target">F2 16 04 1994</span>
					Birth date
				</TooltipFix>

				F3 M F4 945006

				<abbr title="ASCII control character 29 (group separator)">\x1D</abbr>
				F5 N F6 24 04 2021 09 29
				<abbr title="ASCII control character 31 (unit separator)">\x1F</abbr>

				<TooltipFix>
					<span slot="target">
						7N6GCZR3FHC3JL2WYDE4LQ3GHG7TJAK3U6RLBPZJYHK43KJDJA32RUZTXG2LVDKNVYXFL6YPP2TPWMVGPB3H7MNZUTE7X3GN3RZHCUY
					</span>
					Base32 ECDSA signature
				</TooltipFix>
			</code> (whitespaces added for legibility).
		</li>
	</ul>
	<p>
		The data is in the 2D-DOC format, for which we can find
		<a href="https://ants.gouv.fr/Les-solutions/2D-Doc">a specification in french</a>
		on the website of the <i>National Secured Titles Agency</i>. This specification explains how to
		parse the code, and gives us the list of fields:
	</p>
	<table class="table table-bordered border-primary table-sm text-center">
		<thead>
			<tr>
				<th>Screening</th>
				<th>Vaccination</th>
			</tr>
		</thead>
		<tr><td colspan="2">First name </td></tr>
		<tr><td colspan="2">Last name </td></tr>
		<tr><td colspan="2">Birth Date </td></tr>
		<tr><td>Sex</td><td>Birth Date </td></tr>
		<tr><td>Analysis code</td><td>Name of the disease </td></tr>
		<tr><td>Analysis result</td><td>Prophylactic agent </td></tr>
		<tr><td /><td>Vaccine</td></tr>
		<tr><td /><td>Vaccine maker</td></tr>
		<tr><td /><td>Rank of the last vaccination state (1st or 2nd dose)</td></tr>
		<tr><td /><td>Total expected number of doses</td></tr>
		<tr><td>Date and time of the test</td><td>Date of the last vaccination state</td></tr>
		<tr><td /><td>Vaccination state</td></tr>
	</table>
	<p>
		In order to prevent the data in the certificate from being falsified, these fields are followed
		by a base32-encoded signature, to be checked using the <abbr
			title="Elliptic Curve Digital Signature Algorithm">ECDSA</abbr
		>
		algorithm. The list of accepted public keys can be found in the official <i>TousAntiCovid</i> application,
		so I added them to my implementation.
	</p>
	<p>
		While studying the format and its implementation, I found and reported a security vulnerability
		in <i>TousAntiCovid</i>, but that's a story for another time.
		<small>(<a href="https://twitter.com/loH4">Follow me</a> on twitter)</small>
	</p>
	<p>
		If you want more details about the data format, my beautiful TypeScript implementation of it <a
			href="https://github.com/lovasoa/sanipasse/blob/master/src/lib/2ddoc.ts">is on github</a
		>.
	</p>
	<p>
		So, at this point, we have implemented a reader for the code, and everyone can now check
		everyone else's code, and have access to all the fields in it.
	</p>
	<p>
		But starting from that, can we implement what seemed to be the initial goal stated in the
		government's document ?
	</p>
	<h2>Preventing event organizers from seeing too much data</h2>
	<p>
		Ideally, I would want to be able to let organizers validate my presence to their events, but not
		sending them a single bit of information they do not need. As we've seen, it's not possible if
		we just present the QR codes on our test and vaccination certificates. So what can we do about
		it ?
	</p>
	<p>
		We need an intermediary. If I could have something between me and the event organizer, trusted
		by both of us, that could on one side check my QR code, and on the other side validate my
		attendance to the organizer, I wouldn't need to show my entire certificate directly to the
		organizer. So that's what I built.
	</p>
	<figure class="figure text-center mb-3">
		<a href="/sanipasse.svg" target="_blank"
			><img
				src="/sanipasse.svg"
				class="figure-img img-fluid rounded"
				alt="My test result"
				height="200"
			/></a
		>
		<figcaption class="figure-caption">
			Sanipasse checks your pass, but doesn't store it. Only a boolean is sent to the event
			organizer: whether you will attend or not.
		</figcaption>
	</figure>
	<p>
		I built a small open-source website, where you can <a href="/events">create new events</a>,
		specify a list of invitees (with their first and last names), and send them a validation link.
		From that link, they can confirm their attendance, but only if they have a valid health pass.
	</p>
	<p>
		From a technical point of view, it's a <i>SvelteKit</i> isomorphic web application, which uses the
		same code on the frontend and the backend to check the sanitary passes. In the backend, it has a
		small SQL database which stores no personal information: just the list of invitees and their status.
	</p>
	<h5>Security</h5>
	<p>
		The security of such an application is quite critical, so I tried to keep it as simple and small
		as possible. I don't have the means to run a bug bounty, but if you like information security,
		come and <a href="/security.txt" target="_blank">white hack</a> me !
	</p>
	<p>
		If you find something and disclose it responsibly, I'll credit you in the
		<a href="/apropos">about page</a>.
	</p>
	<footer>
		<p>
			That's all for today. I hope you found the dive into french government tech interesting, and
			if you have friends in france, don't hesitate to spread the word about <a href="/"
				>Sanipasse</a
			>.
		</p>
		<hr />

		<p class="fst-italic">
			<a href="https://ophir.dev">Ophir LOJKINE</a>, 2021-05-19 08:00
		</p>
	</footer>
</main>

<style>
	figure {
		width: 50%;
		margin: auto;
		display: block !important;
	}
	table {
		table-layout: fixed;
	}
</style>
