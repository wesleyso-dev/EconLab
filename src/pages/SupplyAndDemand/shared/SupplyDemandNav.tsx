import SubNavbar from '../../../components/SubNavbar/SubNavbar';

const SECTIONS = ['Shifts', 'Tax', 'Subsidy', 'Price Controls'];

export function SupplyDemandNav() {
  return <SubNavbar path="supply-and-demand" links={SECTIONS} />;
}
