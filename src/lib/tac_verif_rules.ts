import type { CommonTestInfo, CommonVaccineInfo } from './common_certificate_info';

const JANSSEN = 'EU/1/20/1525';
const PCR_TESTS = new Set(['943092', '945006', '948455', 'LP6464-4']);
const ANTIGENIC_TESTS = new Set(['945584', 'LP217198-3']);

interface ValidationMetaData {
	testNegativePcrEndHour: number;
	testNegativeAntigenicEndHour: number;
	testNegativePrimoPcrEndHour: number;
	testNegativePrimoAntigenicEndHour: number;
	testPositivePcrStartDay: number;
	testPositivePcrEndDay: number;
	testPositiveAntigenicStartDay: number;
	testPositiveAntigenicEndDay: number;
	recoveryStartDay: number;
	recoveryEndDay: number;
	vaccineDelay: number;
	vaccineDelayMax: number;
	vaccineDelayJanssen: number;
	vaccineDelayMaxJanssen: number;
	vaccineBoosterDelay: number;
	vaccineBoosterDelayMax: number;
	vaccineBoosterDelayUnderAge: number;
	vaccineBoosterAge: number;
}

const defaultValidationMetaData: ValidationMetaData = {
	testNegativePcrEndHour: 24,
	testNegativeAntigenicEndHour: 24,
	testNegativePrimoPcrEndHour: 24,
	testNegativePrimoAntigenicEndHour: 24,
	testPositivePcrStartDay: 11,
	testPositivePcrEndDay: 183,
	testPositiveAntigenicStartDay: 11,
	testPositiveAntigenicEndDay: 183,
	recoveryStartDay: 11,
	recoveryEndDay: 183,
	vaccineDelay: 7,
	vaccineDelayMax: 220,
	vaccineDelayJanssen: 28,
	vaccineDelayMaxJanssen: 6000,
	vaccineBoosterDelay: 0,
	vaccineBoosterDelayMax: 6000,
	vaccineBoosterDelayUnderAge: 0,
	vaccineBoosterAge: 650
};

function hours_since(date: Date): number {
	return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}
function days_since(date: Date): number {
	return hours_since(date) / 24;
}

function is_between(x: number, min: number, max: number): boolean {
	return x >= min && x < max;
}

function validateTest(test: CommonTestInfo, v: ValidationMetaData): boolean {
	const { test_date, is_negative, is_inconclusive, test_type } = test;
	const is_pcr = PCR_TESTS.has(test_type);
	const is_antigenic = ANTIGENIC_TESTS.has(test_type);
	const is_positive = !is_negative && !is_inconclusive;
	return (
		(is_negative &&
			((is_pcr && hours_since(test_date) < v.testNegativePcrEndHour) ||
				(is_antigenic && hours_since(test_date) < v.testNegativeAntigenicEndHour))) ||
		(is_positive &&
			((is_pcr &&
				is_between(days_since(test_date), v.testPositivePcrStartDay, v.testPositivePcrEndDay)) ||
				(is_antigenic &&
					is_between(
						days_since(test_date),
						v.testPositiveAntigenicStartDay,
						v.testPositiveAntigenicEndDay
					))))
	);
}

function validateVaccination(vac: CommonVaccineInfo, date_of_birth: Date, v: ValidationMetaData) {
	const { vaccination_date, prophylactic_agent, doses_expected } = vac;
	const vaccine: string = prophylactic_agent.toUpperCase().trim();
	const age = days_since(date_of_birth) / 365.25;

	return (
		(vaccine == JANSSEN &&
			is_between(days_since(vaccination_date), v.vaccineDelayJanssen, v.vaccineDelayMaxJanssen)) ||
		(age < v.vaccineBoosterAge &&
			vaccine != JANSSEN &&
			((doses_expected == 1 && days_since(vaccination_date) > v.vaccineDelay) ||
				(doses_expected == 2 && days_since(vaccination_date) > v.vaccineDelay) ||
				(doses_expected >= 3 && days_since(vaccination_date) > v.vaccineBoosterDelayUnderAge))) ||
		(age >= v.vaccineBoosterAge &&
			vaccine != JANSSEN &&
			((doses_expected == 1 &&
				is_between(days_since(vaccination_date), v.vaccineDelay, v.vaccineDelayMax)) ||
				(doses_expected == 1 &&
					is_between(days_since(vaccination_date), v.vaccineDelay, v.vaccineDelayMax)) ||
				(doses_expected == 1 &&
					is_between(
						days_since(vaccination_date),
						v.vaccineBoosterDelay,
						v.vaccineBoosterDelayMax
					))))
	);
}
