<script lang="ts">
	import {
		Navbar,
		NavbarBrand,
		Collapse,
		NavbarToggler,
		NavItem,
		NavLink,
		Container,
		Icon
	} from 'sveltestrap';
	let isOpen = false;
</script>

<svelte:head>
	<title>Sanipasse - vérification de pass sanitaire</title>
</svelte:head>

<Navbar color="light" light expand="md">
	<Container>
		<NavbarBrand href="/">
			<Icon name="calendar2-check" />
			Sanipasse
		</NavbarBrand>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} class="me-2" />
		<Collapse {isOpen} navbar expand="md" on:update={(e) => (isOpen = e.detail.isOpen)}>
			<ul class="ms-auto navbar-nav">
				<NavItem>
					<NavLink href="/articles">Articles</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/apropos">À propos</NavLink>
				</NavItem>
			</ul>
		</Collapse>
	</Container>
</Navbar>

<main>
	<Container>
		<slot />
	</Container>
</main>

<style>
	@import 'bootstrap/dist/css/bootstrap.min.css';
	@import 'bootstrap-icons/font/bootstrap-icons.css';

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
