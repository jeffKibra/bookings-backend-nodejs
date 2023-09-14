import { Router, Request } from 'express';

//

const router = Router();

router
  .route('/')
  .get((req, res) => {
    console.log('gettings orgs list');
  })
  .post((req, res) => {
    const data = req.body;
    console.log('creating orgs list');
  })
  .put((req, res) => {
    const data = req.body;

    console.log('updating org with id:' + orgId);
  });

router.route('/:id').get().put().delete();

router.get('/:id', (req: Request, res) => {
  const orgId = req?.params?.id;

  console.log('getting org with id: ' + orgId);
});

export default router;
