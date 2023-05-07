import React, { useEffect, useState } from "react";
import { useStateContext } from "../context";
import { useLocation, useNavigate } from "react-router-dom";

const TransactionList = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const { contract, address, getTxns } = useStateContext();

  useEffect(() => {
    if (!contract) return;
    (async () => {
      const txnRes = await getTxns(state.pId);
      setTxns(txnRes);
      console.log(txnRes);
    })();
  }, [contract, address]);

  const mapType = (typ) => typ === 0 ? "CREDIT" : "DEBIT"

  return <div>
    <table className="text-white table">
        <thead>
            <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Type</th>
            </tr>
        </thead>
        <tbody>
            {txns && (
                txns.map((tx, i) => (
                    <tr>
                        <td>{i+1}</td>
                        <td>{tx.timestamp}</td>
                        <td>{tx.from}</td>
                        <td>{tx.to}</td>
                        <td>{tx.amount} MATIC</td>
                        <td>{mapType(tx.type)}</td>
                    </tr>
                ))
            )}
        </tbody>
        <tfoot className="w-full">
            <button type="button" onClick={() => navigate('/')} className="text-center font-bold text-white">Back</button>
        </tfoot>
    </table>
  </div>;
};

export default TransactionList;
