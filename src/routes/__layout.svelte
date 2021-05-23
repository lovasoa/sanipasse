<script lang="ts">
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Container, Icon } from 'sveltestrap';
</script>

<svelte:head>
	<title>Sanipasse - vérification de pass sanitaire</title>
	<meta
		name="description"
		content="Sanipasse permet de vérifier les certificats de test et de vaccination,
	et d'organiser des évènements en toute sécurité."
	/>
</svelte:head>

<Navbar color="light" light expand="md">
	<Container>
		<NavbarBrand href="/">
			<Icon name="calendar2-check" />
			Sanipasse
		</NavbarBrand>
		<Nav navbar>
			<NavItem>
				<NavLink href="/apropos">À propos</NavLink>
			</NavItem>
		</Nav>
	</Container>
</Navbar>

<main>
	<Container>
		<slot />
	</Container>
</main>

<style>
	main {
		height: 90vh;
		align-items: center;
		display: flex;
		justify-content: center;
		flex-direction: column;
		margin: 20px;
		flex-flow: wrap;
		width: 85%;
		max-width: 1024px;
		margin: auto;
		margin-top: 10px;
	}
</style>
