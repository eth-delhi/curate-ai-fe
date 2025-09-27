import React from "react";
import WalletMethods from "../magic/cards/WalletMethodsCard";
import SendTransaction from "../magic/cards/SendTransactionCard";
import Spacer from "@/components/ui/Spacer";
import { LoginProps } from "@/utils/types";
import UserInfo from "@/components/magic/cards/UserInfoCard";
// import SmartContract from "../magic/cards/SmartContract";

export default function Dashboard({ token, setToken }: LoginProps) {
  return (
    <div className="home-page">
      <div className="cards-container">
        <UserInfo token={token} setToken={setToken} />
        <Spacer size={10} />
        <SendTransaction />
        <Spacer size={10} />
        <WalletMethods token={token} setToken={setToken} />
        <Spacer size={15} />
        {/* {isTestnet() && <SmartContract />} */}
      </div>
    </div>
  );
}
