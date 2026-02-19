const symbolMap = {
  1: "@",
  2: "#",
  3: "$",
  4: "%",
  5: "^",
  6: "&"
}; //this will be used in DSST 

export const getSymbol = (num: number): string => {
  const symbolMap: { [key: number]: string } = {
    1: '@',
    2: '#',
    3: '$',
    4: '%',
    5: '^',
    6: '&'
  };
  return symbolMap[num] || '?';
};