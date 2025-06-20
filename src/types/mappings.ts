/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mappings.json`.
 */
export type Mappings = {
  address: "6ytMmvJR2YYsuPR7FSQUQnb7UGi1rf36BrXzZUNvKsnj";
  metadata: {
    name: "mappings";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "get";
      discriminator: [161, 224, 50, 61, 5, 210, 122, 216];
      accounts: [
        {
          name: "val";
        }
      ];
      args: [
        {
          name: "domain";
          type: "u64";
        },
        {
          name: "key";
          type: "u64";
        }
      ];
      returns: "u64";
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "val";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "arg";
                path: "domain";
              },
              {
                kind: "arg";
                path: "key";
              }
            ];
          };
        },
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "domain";
          type: "u64";
        },
        {
          name: "key";
          type: "u64";
        }
      ];
    },
    {
      name: "set";
      discriminator: [198, 51, 53, 241, 116, 29, 126, 194];
      accounts: [
        {
          name: "val";
          writable: true;
        }
      ];
      args: [
        {
          name: "domain";
          type: "u64";
        },
        {
          name: "key";
          type: "u64";
        },
        {
          name: "value";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "val";
      discriminator: [117, 195, 162, 127, 63, 84, 168, 122];
    }
  ];
  types: [
    {
      name: "val";
      type: {
        kind: "struct";
        fields: [
          {
            name: "value";
            type: "u64";
          }
        ];
      };
    }
  ];
};
