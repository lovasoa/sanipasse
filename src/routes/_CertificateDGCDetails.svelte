<script type="ts">
	import { Table, Card, CardHeader, CardBody, CardTitle } from 'sveltestrap';
	import type { DGC } from '$lib/digital_green_certificate';
	export let certificate: DGC;
	const { hcert } = certificate;
	function showTimestamp(time_seconds: number | string) {
		const source = typeof time_seconds === 'number' ? time_seconds * 1000 : time_seconds;
		return new Date(source).toLocaleDateString('fr-FR');
	}
	function lineIf<E, F>(elem: E | undefined | null | false, map: (x: E) => F): F[] {
		return !elem ? [] : [map(elem)];
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
		'EU/1/20/1528': 'Comirnaty',
		'EU/1/20/1507': 'COVID-19 Vaccine Moderna',
		'EU/1/21/1529': 'Vaxzevria',
		'EU/1/20/1525': 'COVID-19 Vaccine Janssen'
	};

	const diseases: { [code: string]: string } = {
		'840539006': 'COVID-19'
	};

	const issuers: { [code: string]: string } = {
		CNAM: "Caisse Nationale d'Assurance Maladie"
	};

	const test_result: { [code: string]: string } = {
		'260415000': 'Not detected',
		'260373001': 'Detected'
	};

	function flag_emoji(country: string) {
		const codes = [0xd83c, 0xdde6, 0xd83c, 0xdde6]; // 🇦🇦
		for (const i of [0, 1]) codes[i * 2 + 1] += country[i].charCodeAt(0) - 'A'.charCodeAt(0);
		return String.fromCharCode(...codes);
	}

	interface Line {
		name: string;
		value: string | number;
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
				...lineIf(hcert.nam.fnt != hcert.nam.fn && hcert.nam.fnt, (value) => ({
					name: 'Translittération latine du nom',
					value
				})),
				...lineIf(hcert.nam.gn, (value) => ({
					name: 'Prénom',
					value
				})),
				...lineIf(hcert.nam.gnt != hcert.nam.gn && hcert.nam.gnt, (value) => ({
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
				{ name: 'Entité émettrice', value: vaccine.is },
				{ name: 'Fabricant de vaccin', value: manufacturers[vaccine.ma] || vaccine.ma },
				{ name: 'Produit vaccinal', value: vaccines[vaccine.mp] || vaccine.mp },
				{ name: 'Agent prophylactique', value: vaccine.vp },
				{ name: 'Maladie ciblée', value: diseases[vaccine.tg] || vaccine.tg },
				{ name: 'Identifiant unique', value: vaccine.ci }
			]
		})),
		...(hcert.t || []).map((test) => ({
			title: 'Informations du test de dépistage',
			lines: [
				{ name: 'Résultat du test', value: test_result[test.tr] || test.tr },
				{ name: 'Pays de test', value: `${flag_emoji(test.co)} (${test.co})` },
				{ name: 'Type de test', value: showTimestamp(test.tt) },
				{ name: 'Entité émettrice', value: test.is },
				...lineIf(test.ma, (value) => ({ name: 'Nom RAT du test et du fabricant', value })),
				...lineIf(test.nm, (value) => ({ name: 'Nom NAA', value })),
				...lineIf(test.sc, (d) => ({ name: 'Date', value: showTimestamp(d) })),
				{ name: 'Identifiant unique', value: test.ci }
			]
		})),
		...(hcert.r || []).map((r) => ({
			title: 'Informations de rémission',
			lines: [
				{ name: 'Valide à partir du', value: showTimestamp(r.df) },
				{ name: "Valide jusqu'au", value: showTimestamp(r.du) },
				{ name: 'Date du premier test positif', value: showTimestamp(r.fr) },
				{ name: 'Pays du test', value: r.co },
				{ name: 'Identifiant unique', value: r.ci }
			]
		})),
		{
			title: 'Informations générales de la signature',
			lines: [
				...lineIf(certificate.issuedAt, (issuedAt) => ({
					name: 'Date de Création',
					value: showTimestamp(issuedAt)
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
				{ name: 'Émetteur', value: certificate.certificate.issuer },
				{ name: 'Sujet', value: certificate.certificate.subject },
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
		<CardBody>
			<Table class="table-sm">
				<tbody>
					{#each card.lines as line}
						<tr>
							<th scope="row" class="text-start">{line.name}</th>
							<td class="text-end">{line.value}</td>
						</tr>
					{:else}
						Aucune information
					{/each}
				</tbody>
			</Table>
		</CardBody>
	</Card>
{/each}

<details>
	<summary>Données brutes</summary>
	<code><pre>{JSON.stringify(certificate, null, '  ')}</pre></code>
</details>

<style>
	tbody {
		overflow-wrap: anywhere;
	}
</style>
