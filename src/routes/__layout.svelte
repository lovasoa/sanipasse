<script lang="ts">
	import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Container, Icon } from 'sveltestrap';
</script>

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
