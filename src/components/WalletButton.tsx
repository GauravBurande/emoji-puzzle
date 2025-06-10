import { useWallet } from '../hooks/useWallet';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  const { isConnected, shortAddress } = useWallet();

  return (
    <div className="flex items-center gap-2">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !text-sm !px-4 !py-2 !h-auto !font-medium" />
      {isConnected && (
        <div className="text-green-400 text-sm font-mono">
          {shortAddress}
        </div>
      )}
    </div>
  );
};
