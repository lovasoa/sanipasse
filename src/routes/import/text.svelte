<script type="ts">
	import CodeFound from '../_CodeFound.svelte';
	import { Input } from 'sveltestrap';
	let codeFound: string | undefined = undefined;
</script>

<p>
	Les QR codes sur les certificats de test et de vaccination contiennent un lien. Vous pouvez coller
	ce lien ici directement.
</p>
<Input
	type="url"
	bind:value={codeFound}
	placeholder="https://bonjour.tousanticovid.gouv.fr/app/wallet?v=DC..."
/>
<CodeFound bind:codeFound />
