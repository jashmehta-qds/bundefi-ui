export const formatTokenAddress = (address: string) => {
  if (!address || typeof address !== "string") return "";

  // Check if it's ETH
  if (address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    return "ETH";
  }

  // Shorten other addresses
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}; 