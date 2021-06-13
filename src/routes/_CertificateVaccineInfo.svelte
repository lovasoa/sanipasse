<script type="ts">
	import { Table, Card, CardHeader, CardBody, CardTitle } from 'sveltestrap';
	import type { VaccineCertificate } from '../lib/2ddoc';
	export let certificate: VaccineCertificate;
</script>

<Card class="mb-3">
	<CardHeader>
		<CardTitle>Certificat de vaccination</CardTitle>
	</CardHeader>
	<CardBody>
		<Table class="table-sm">
			<tbody>
				<tr>
					<th class="text-start">Prénom(s)</th>
					<td class="text-end">{certificate.vaccinated_first_name}</td>
				</tr>

				<tr>
					<th class="text-start">Nom</th>
					<td class="text-end">{certificate.vaccinated_last_name}</td>
				</tr>

				<tr>
					<th class="text-start">Date de naissance</th>
					<td class="text-end">{certificate.vaccinated_birth_date.toLocaleDateString('fr-FR')}</td>
				</tr>

				<tr>
					<th class="text-start">Maladie couverte</th>
					<td class="text-end">{certificate.disease}</td>
				</tr>

				<tr>
					<th class="text-start"
						><a href="https://fr.wikipedia.org/wiki/Classification_ATC" target="_blank"
							>Agent prophylactique</a
						></th
					>
					<td class="text-end">{certificate.prophylactic_agent}</td>
				</tr>

				<tr>
					<th class="text-start">Nom vaccin</th>
					<td class="text-end">{certificate.vaccine}</td>
				</tr>

				<tr>
					<th class="text-start">Fabricant vaccin</th>
					<td class="text-end">{certificate.vaccine_maker}</td>
				</tr>

				<tr>
					<th class="text-start">Doses reçues</th>
					<td class="text-end">{certificate.doses_received}</td>
				</tr>

				<tr>
					<th class="text-start">Doses attendues</th>
					<td class="text-end">{certificate.doses_expected}</td>
				</tr>

				<tr>
					<th class="text-start">Date dernière dose</th>
					<td class="text-end">{certificate.last_dose_date.toLocaleDateString('fr-FR')}</td>
				</tr>

				<tr>
					<th class="text-start">Etat vaccination</th>
					<td class="text-end"
						>{certificate.cycle_state === 'TE' ? 'Terminé' : 'En cours'}
						<small>({certificate.cycle_state})</small></td
					>
				</tr>
			</tbody>
		</Table>
	</CardBody>
</Card>
