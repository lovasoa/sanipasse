<script type="ts">
	import { Table, Card, CardHeader, CardTitle } from 'sveltestrap';
	import type { DGC } from '$lib/digital_green_certificate';
	import { sha256 } from '$lib/sha256';
	export let certificate: DGC;
	const { hcert } = certificate;

	function showTimestamp(time_seconds: number | string, options: { include_time?: boolean } = {}) {
		const source = typeof time_seconds === 'number' ? time_seconds * 1000 : time_seconds;
		const date = new Date(source);
		const date_str = date.toLocaleDateString('fr-FR');
		const time_str = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
		return options.include_time ? `${date_str} à ${time_str}` : date_str;
	}

	function lineIf<E, F>(elem: E | undefined | null, map: (x: E) => F): F[] {
		return !elem ? [] : [map(elem)];
	}

	function lineIfDifferent<F>(
		a: string | undefined,
		b: string | undefined,
		map: (x: string) => F
	): F[] {
		if (a && b && a.toLowerCase() === b.toLowerCase()) return [];
		return lineIf(a, map);
	}

	function parseX509Attributes(line: string): { C?: string; O?: string; CN?: string; OU?: string } {
		const attrs = line.split(',');
		return Object.fromEntries(attrs.map((line) => line.trim().split('=')));
	}

	const manufacturers: { [code: string]: string } = {
		'ORG-100001699': 'AstraZeneca AB',
		'ORG-100030215': 'Biontech Manufacturing GmbH',
		'ORG-100001417': 'Janssen-Cilag International',
		'ORG-100031184': 'Moderna Biotech Spain S.L.',
		'ORG-100006270': 'Curevac AG',
		'ORG-100013793': 'CanSino Biologics',
		'ORG-100020693': 'China Sinopharm International Corp. - Beijing',
		'ORG-100010771': 'Sinopharm Weiqida Europe Pharmaceutical s.r.o. - Prague',
		'ORG-100032020': 'Novavax CZ AS'
	};

	const vaccines: { [code: string]: string } = {
		'EU/1/20/1528': 'vaccin Pfizer–BioNTech contre la Covid-19',
		'EU/1/20/1507': 'vaccin de Moderna contre la Covid-19',
		'EU/1/21/1529': "vaccin d'AstraZeneca-Oxford contre la Covid-19",
		'EU/1/20/1525': 'vaccin de Janssen contre la Covid-19'
	};

	const diseases: { [code: string]: string } = {
		'840539006': 'COVID-19'
	};

	const issuers: { [code: string]: string } = {
		CNAM: "Caisse Nationale d'Assurance Maladie"
	};

	const test_result: { [code: string]: string } = {
		'260415000': 'Test négatif',
		'260373001': 'Test positif'
	};

	const test_types: { [code: string]: string } = {
		'LP217198-3': 'Test immunologique rapide',
		'LP6464-4': "Amplification d'acide nucléique (PCR)"
	};

	const organizations: { [code: string]: string } = {
		CNAM: "Caisse nationale de l'Assurance Maladie",
		APHP: 'Assistance Publique – Hôpitaux de Paris'
	};

	const issuer_info = parseX509Attributes(certificate.certificate.issuer);
	const subject_info = parseX509Attributes(certificate.certificate.subject);

	function flag_emoji(country: string) {
		const codes = [0xd83c, 0xdde6, 0xd83c, 0xdde6]; // 🇦🇦
		for (const i of [0, 1]) codes[i * 2 + 1] += country[i].charCodeAt(0) - 'A'.charCodeAt(0);
		return String.fromCharCode(...codes);
	}

	interface Line {
		name: string;
		value: Promise<string> | string | number;
		link?: string;
	}
	interface Card {
		title: string;
		lines: Line[];
	}
	const cards: Card[] = [
		{
			title: 'Patient',
			lines: [
				...lineIf(hcert.nam.fn, (value) => ({
					name: 'Nom',
					value
				})),
				...lineIfDifferent(hcert.nam.fnt, hcert.nam.fn, (value) => ({
					name: 'Translittération latine du nom',
					value
				})),
				...lineIf(hcert.nam.gn, (value) => ({
					name: 'Prénom',
					value
				})),
				...lineIfDifferent(hcert.nam.gnt, hcert.nam.gn, (value) => ({
					name: 'Translittération latine du prénom',
					value
				})),
				{ name: 'Date de naissance', value: hcert.dob }
			]
		},
		...(hcert.v || []).map((vaccine) => ({
			title: 'Informations de vaccination',
			lines: [
				{ name: 'Pays de vaccination', value: `${flag_emoji(vaccine.co)} (${vaccine.co})` },
				{ name: 'Numéro de la dose', value: vaccine.dn },
				{ name: 'Nombre de doses requises', value: vaccine.sd },
				{ name: 'Date de vaccination', value: showTimestamp(vaccine.dt) },
				{ name: 'Entité émettrice', value: organizations[vaccine.is] || vaccine.is },
				{ name: 'Fabricant de vaccin', value: manufacturers[vaccine.ma] || vaccine.ma },
				{
					name: 'Produit vaccinal',
					value: vaccines[vaccine.mp] || vaccine.mp,
					link: vaccines[vaccine.mp] && 'https://fr.wikipedia.org/wiki/' + vaccines[vaccine.mp]
				},
				{ name: 'Agent prophylactique', value: vaccine.vp },
				{ name: 'Maladie ciblée', value: diseases[vaccine.tg] || vaccine.tg },
				{ name: 'Identifiant unique', value: vaccine.ci },
				{
					name: 'Empreinte numérique',
					value: sha256(vaccine.co.toUpperCase() + vaccine.ci)
				}
			]
		})),
		...(hcert.t || []).map((test) => ({
			title: 'Informations du test de dépistage',
			lines: [
				{
					name: 'Résultat du test',
					value: test_result[test.tr] || test.tr,
					link: 'http://purl.bioontology.org/ontology/SNOMEDCT/' + test.tr
				},
				...lineIf(test.sc, (d) => ({
					name: 'Date de prélèvement',
					value: showTimestamp(d, { include_time: true })
				})),
				{ name: 'Pays de test', value: `${flag_emoji(test.co)} (${test.co})` },
				{
					name: 'Type de test',
					value: test_types[test.tt] || test.tt,
					link: 'https://loinc.org/' + test.tt
				},
				{ name: 'Entité émettrice', value: organizations[test.is] || test.is },
				...lineIf(test.ma, (value) => ({
					name: 'Identifiant européen du test antigénique',
					value,
					link: 'https://covid-19-diagnostics.jrc.ec.europa.eu/devices/detail/' + value
				})),
				...lineIf(test.nm, (value) => ({
					name: "Nom du test par amplification d'acide nucléique",
					value
				})),
				{ name: 'Identifiant unique', value: test.ci },
				{
					name: 'Empreinte numérique',
					value: sha256(test.co.toUpperCase() + test.ci)
				}
			]
		})),
		...(hcert.r || []).map((r) => ({
			title: 'Informations de rémission',
			lines: [
				{ name: 'Valide à partir du', value: showTimestamp(r.df) },
				{ name: "Valide jusqu'au", value: showTimestamp(r.du, { include_time: true }) },
				{ name: 'Date du premier test positif', value: showTimestamp(r.fr) },
				{ name: 'Pays du test', value: r.co },
				{ name: 'Identifiant unique', value: r.ci }
			]
		})),
		{
			title: 'Informations sur la signature numérique',
			lines: [
				...lineIf(certificate.issuedAt, (issuedAt) => ({
					name: 'Date de Création',
					value: showTimestamp(issuedAt, { include_time: true })
				})),
				...lineIf(certificate.expiresAt, (expiresAt) => ({
					name: "Date d'expiration",
					value: showTimestamp(expiresAt)
				})),
				...lineIf(certificate.issuer, (issuer) => ({
					name: 'Autorité émettrice',
					value: issuers[issuer] || issuer
				})),
				{ name: 'Version du certificat vert', value: hcert.ver }
			]
		},
		{
			title: 'Informations générales du certificat de signature',
			lines: [
				...lineIf(issuer_info.C, (c) => ({
					name: "Pays d'origine",
					value: `${flag_emoji(c)} (${c})`
				})),
				...lineIf(subject_info.O, (org) => ({
					name: 'Organisation émettrice',
					value: (organizations[org] || org) + (subject_info.OU ? ' - ' + subject_info.OU : '')
				})),
				...lineIf(subject_info.CN, (value) => ({ name: 'Nom du certificat', value })),
				{ name: 'Certificat signé par', value: certificate.certificate.issuer },
				{
					name: 'Date de début de validité',
					value: showTimestamp(certificate.certificate.notBefore)
				},
				{ name: 'Date de fin de validité', value: showTimestamp(certificate.certificate.notAfter) }
			]
		}
	];
</script>

{#each cards as card}
	<Card class="mb-3 mt-3">
		<CardHeader>
			<CardTitle>{card.title}</CardTitle>
		</CardHeader>
		<div class="card-body px-1">
			<Table class="table-sm">
				<tbody>
					{#each card.lines as line}
						<tr>
							<th scope="row" class="text-start">{line.name}</th>
							<td class="text-end text-break">
								{#if line.link}
									<a href={line.link}>{line.value}</a>
								{:else}
									{#await line.value}
										chargement...
									{:then value}
										{value}
									{:catch e}
										<pre class="bg-warning">{e}</pre>
									{/await}
								{/if}
							</td>
						</tr>
					{:else}
						Aucune information
					{/each}
				</tbody>
			</Table>
		</div>
	</Card>
{/each}

<details>
	<summary>Données brutes</summary>
	<code><pre>{JSON.stringify(certificate, null, '  ')}</pre></code>
</details>
