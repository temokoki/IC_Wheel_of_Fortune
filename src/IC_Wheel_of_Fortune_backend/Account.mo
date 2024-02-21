import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import CRC32 "./CRC32";
import SHA224 "./SHA224";

module {
  func beBytes(n : Nat32) : [Nat8] {
    func byte(n : Nat32) : Nat8 {
      Nat8.fromNat(Nat32.toNat(n & 0xff));
    };
    [byte(n >> 24), byte(n >> 16), byte(n >> 8), byte(n)];
  };

  public func principalToSubaccount(principal : Principal) : Blob {
    let idHash = SHA224.Digest();
    idHash.write(Blob.toArray(Principal.toBlob(principal)));
    let hashSum = idHash.sum();
    let crc32Bytes = beBytes(CRC32.ofArray(hashSum));
    let blob = Blob.fromArray(Array.append(crc32Bytes, hashSum));

    return blob;
  };

  public func defaultSubaccount() : Blob {
    Blob.fromArrayMut(Array.init(32, 0 : Nat8));
  };

  public func accountIdentifier(principal : Principal, subaccount : Blob) : Blob {
    let hash = SHA224.Digest();
    hash.write([0x0A]);
    hash.write(Blob.toArray(Text.encodeUtf8("account-id")));
    hash.write(Blob.toArray(Principal.toBlob(principal)));
    hash.write(Blob.toArray(subaccount));
    let hashSum = hash.sum();
    let crc32Bytes = beBytes(CRC32.ofArray(hashSum));
    Blob.fromArray(Array.append(crc32Bytes, hashSum));
  };
};
