export const mockConversionData = {
  "lastUpdated": "2024-01-08T12:00:00Z",
  "dataSource": "Test data",
  "config": {
    "showAdvertisements": true,
    "showAffiliateLinks": true
  },
  "programs": {
    "chase_ur": {
      "name": "Chase Ultimate Rewards",
      "type": "bank"
    },
    "amex_mr": {
      "name": "Amex Membership Rewards", 
      "type": "bank"
    },
    "hyatt": {
      "name": "World of Hyatt",
      "type": "hotel"
    },
    "united": {
      "name": "United MileagePlus",
      "type": "airline"
    },
    "marriott": {
      "name": "Marriott Bonvoy",
      "type": "hotel"
    }
  },
  "conversions": [
    {
      "from": "chase_ur",
      "to": "hyatt",
      "rate": 1.0,
      "bonus": false,
      "bonusRate": null,
      "instantTransfer": true
    },
    {
      "from": "chase_ur",
      "to": "united",
      "rate": 1.0,
      "bonus": true,
      "bonusRate": 1.3,
      "bonusEndDate": "2024-01-31",
      "instantTransfer": true
    },
    {
      "from": "amex_mr",
      "to": "marriott",
      "rate": 1.0,
      "bonus": false,
      "bonusRate": null,
      "instantTransfer": false
    },
    {
      "from": "marriott",
      "to": "united",
      "rate": 0.33,
      "bonus": false,
      "bonusRate": null,
      "instantTransfer": false,
      "note": "3:1 ratio"
    }
  ],
  "affiliateLinks": [
    {
      "name": "Test Card",
      "program": "chase_ur",
      "bonus": "60,000 points",
      "url": "#",
      "annualFee": "$95"
    }
  ]
}