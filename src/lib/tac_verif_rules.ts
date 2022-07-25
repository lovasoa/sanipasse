import type {
	CommonCertificateInfo,
	CommonTestInfo,
	CommonVaccineInfo
} from './common_certificate_info';
import validity_data from '../assets/validity_data.json'; // Constants containing the rules for the verification of the certificate
import { parse as parse_period } from 'tinyduration';
import type { Duration as Period } from 'tinyduration';
import blacklist_text from '../assets/blacklist_text.json';
const blacklist_set = new Set(blacklist_text.split(' '));

const JANSSEN = 'EU/1/20/1525';
const PCR_TESTS = new Set(['943092', '945006', '948455', 'LP6464-4']);
const ANTIGENIC_TESTS = new Set(['945584', 'LP217198-3']);

type RuleData = typeof validity_data.health | typeof validity_data.vaccine;

function add_period(date: Date, duration: Period): Date {
	const m = duration.negative ? -1 : 1;
	const d = new Date(date);
	if (duration.years) d.setFullYear(d.getFullYear() + duration.years * m);
	if (duration.months) d.setMonth(d.getMonth() + duration.months * m);
	if (duration.days) d.setDate(d.getDate() + duration.days * m);
	if (duration.hours) d.setHours(d.getHours() + duration.hours * m);
	if (duration.minutes) d.setMinutes(d.getMinutes() + duration.minutes * m);
	if (duration.seconds) d.setSeconds(d.getSeconds() + duration.seconds * m);
	return d;
}

function add_hours(date: Date, hours: number): Date {
	return add_period(date, { hours });
}

function add_days(date: Date, days: number): Date {
	return add_period(date, { days });
}

export class ValidityPeriod {
	start: Date;
	end: Date;
	constructor(start: Date, end: Date) {
		this.start = start;
		this.end = end;
	}
}

function testValidityInterval(
	test: CommonTestInfo,
	date_of_birth: Date,
	v: RuleData
): ValidityPeriod {
	const { test_date, is_negative, is_inconclusive, test_type } = test;
	const is_pcr = PCR_TESTS.has(test_type);
	const is_antigenic = ANTIGENIC_TESTS.has(test_type);
	if (!is_pcr && !is_antigenic) throw new Error(`Type de test inconnu: ${test_type}`);
	const is_positive = !is_negative && !is_inconclusive;

	if (is_negative) {
		const duration = is_pcr ? v.testNegativePcrEndHour : v.testNegativeAntigenicEndHour;
		let start = test_date;
		let end = add_hours(test_date, duration);
		if ('testAcceptanceAgePeriod' in v) {
			const period = parse_period(v.testAcceptanceAgePeriod);
			const end_accept = add_period(date_of_birth, period);
			end = end < end_accept ? end : end_accept;
		}
		if (end < start) throw new Error('Passe vaccinal: les tests ne sont plus acceptés');
		return new ValidityPeriod(start, end);
	} else if (is_positive) {
		const start_days = is_pcr ? v.testPositivePcrStartDay : v.testPositiveAntigenicStartDay;
		const end_days = is_pcr ? v.testPositivePcrEndDay : v.testPositiveAntigenicEndDay;
		const start = add_days(test_date, start_days);
		const end = add_days(test_date, end_days);
		return new ValidityPeriod(start, end);
	}
	throw new Error('Test non conclusif');
}

function vaccinationValidityInterval(
	vac: CommonVaccineInfo,
	date_of_birth: Date,
	v: RuleData
): ValidityPeriod {
	const { vaccination_date, prophylactic_agent, doses_expected, doses_received } = vac;
	if (doses_received < doses_expected)
		throw new Error(`Cycle vaccinal incomplet: dose ${doses_received} sur ${doses_expected}`);
	const vaccine: string = prophylactic_agent.toUpperCase().trim();
	if (vaccine === JANSSEN) {
		const start = add_days(vaccination_date, v.vaccineDelayJanssen);
		const end = add_days(vaccination_date, v.vaccineDelayMaxJanssen);
		return new ValidityPeriod(start, end);
	}
	// Date at which the patient will have (or had) the age for a booster shot
	const VACCINE_BOOSTER_AGE_PERIOD = parse_period(v.vaccineBoosterAgePeriod);
	const booster_date = add_period(date_of_birth, VACCINE_BOOSTER_AGE_PERIOD);
	const is_under_age = add_days(vaccination_date, v.vaccineBoosterDelayUnderAge) < booster_date;
	const toggle_date = new Date(v.vaccineBoosterToggleDate);
	const delays = is_under_age
		? [v.vaccineBoosterDelay, v.vaccineBoosterDelayNew]
		: [v.vaccineBoosterDelayUnderAge, v.vaccineBoosterDelayUnderAgeNew];
	const booster_delay = delays[vaccination_date < toggle_date ? 0 : 1];
	const start_days = doses_expected <= 2 ? v.vaccineDelay : booster_delay;
	const start = add_days(vaccination_date, start_days);
	const over_age_max_delay =
		doses_expected <= 2 && doses_received == doses_expected
			? v.vaccineDelayMax
			: v.vaccineBoosterDelayMax;
	const over_age_end = add_days(vaccination_date, over_age_max_delay);
	const end = over_age_end < booster_date ? booster_date : over_age_end;
	return new ValidityPeriod(start, end);
}

export function validityInterval(
	cert: CommonCertificateInfo,
	vaccinePass?: boolean
): ValidityPeriod | { invalid: string } {
	if (vaccinePass === undefined)
		vaccinePass = new Date(validity_data.vaccinePassStartDate) < new Date();
	const v = vaccinePass ? validity_data.vaccine : validity_data.health;
	const { type, date_of_birth } = cert;
	try {
		return type === 'test'
			? testValidityInterval(cert, date_of_birth, v)
			: vaccinationValidityInterval(cert, date_of_birth, v);
	} catch (e) {
		return { invalid: e instanceof Error ? e.message : `${e}` };
	}
}

export function findCertificateError(
	c: CommonCertificateInfo,
	target_date?: Date,
	vaccinePass?: boolean
): string | undefined {
	if (target_date === undefined) target_date = new Date();
	if (blacklist_set.has(c.fingerprint))
		return 'Ce certificat est sur liste noire. Il est probablement frauduleux.';
	const validity = validityInterval(c, vaccinePass);
	if ('invalid' in validity) return validity.invalid;
	const { start, end } = validity;
	const err_msg = `La validité de ce certificat de ${c.type}`;
	if (start > target_date) return `${err_msg} commence le ${start.toLocaleDateString('fr')}.`;
	if (end < target_date) return `${err_msg} se termine le ${end.toLocaleDateString('fr')}.`;
}
